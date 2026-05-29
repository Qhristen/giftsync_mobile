import { Category, CreateProductDto, PaginatedProductResponse, Product, UpdateProductDto } from '@/types';
import { baseApi, AxiosBaseQueryError } from './baseApi';
import type { EndpointBuilder } from '@reduxjs/toolkit/query';

export const productApi = baseApi.injectEndpoints({
    endpoints: (builder: EndpointBuilder<any, string, string>) => ({
        getRecommendations: builder.query<Product[], { contactId?: string; occasionId?: string }>({
            query: (params) => ({
                url: '/api/v1/recommendations',
                method: 'GET',
                params,
            }),
            providesTags: ['Recommendations'],
        }),
        getRecommendationsV2: builder.query<Product[], { occasionId: string; limit?: number }>({
            query: (data) => ({
                url: '/api/v1/recommendations/v2',
                method: 'POST',
                data,
            }),
            providesTags: ['Recommendations'],
        }),
        getProducts: builder.query<PaginatedProductResponse, { page?: number; limit?: number;[key: string]: unknown }>({
            query: (params) => ({
                url: '/api/v1/products',
                method: 'GET',
                params,
            }),
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                const { page, ...other } = queryArgs || {};
                return `${endpointName}-${JSON.stringify(other)}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                const params = arg as { page?: number } | undefined;
                if (!params || params.page === 1) {
                    return newItems;
                }
                
                // Update existing items if they are already in the cache, otherwise append
                newItems.items.forEach(newItem => {
                    const index = currentCache.items.findIndex(item => item.id === newItem.id);
                    if (index !== -1) {
                        currentCache.items[index] = newItem;
                    } else {
                        currentCache.items.push(newItem);
                    }
                });
                
                currentCache.meta = newItems.meta;
            },
            forceRefetch: ({ currentArg, previousArg, endpointState }) => {
                return currentArg?.page !== previousArg?.page || endpointState?.status === 'uninitialized';
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map(({ id }) => ({ type: 'Products' as const, id })),
                        { type: 'Products', id: 'LIST' },
                    ]
                    : [{ type: 'Products', id: 'LIST' }],
        }),
        getProductsByBusiness: builder.query<PaginatedProductResponse, { businessId: string; page?: number; limit?: number }>({
            query: ({ businessId, ...params }) => ({
                url: `/api/v1/products/business/${businessId}`,
                method: 'GET',
                params,
            }),
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                const { page, businessId, ...other } = queryArgs || {};
                return `${endpointName}-${businessId}-${JSON.stringify(other)}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                const params = arg as { page?: number } | undefined;
                if (!params || params.page === 1) {
                    return newItems;
                }
                
                newItems.items.forEach(newItem => {
                    const index = currentCache.items.findIndex(item => item.id === newItem.id);
                    if (index !== -1) {
                        currentCache.items[index] = newItem;
                    } else {
                        currentCache.items.push(newItem);
                    }
                });
                
                currentCache.meta = newItems.meta;
            },
            forceRefetch: ({ currentArg, previousArg, endpointState }) => {
                return currentArg?.page !== previousArg?.page || endpointState?.status === 'uninitialized';
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map(({ id }) => ({ type: 'Products' as const, id })),
                        { type: 'Products', id: 'LIST' },
                    ]
                    : [{ type: 'Products', id: 'LIST' }],
        }),
        getProductById: builder.query<Product, string>({
            query: (id) => ({
                url: `/api/v1/products/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Products', id }],
        }),
        createProduct: builder.mutation<Product, { businessId: string; data: CreateProductDto }>({
            query: ({ businessId, data }) => ({
                url: `/api/v1/products/business/${businessId}`,
                method: 'POST',
                data,
            }),
            invalidatesTags: [{ type: 'Products', id: 'LIST' }],
        }),
        updateProduct: builder.mutation<Product, { businessId: string; productId: string; data: UpdateProductDto }>({
            query: ({ businessId, productId, data }) => ({
                url: `/api/v1/products/business/${businessId}/${productId}`,
                method: 'PATCH',
                data,
            }),
            async onQueryStarted({ businessId, productId, data }, { dispatch, queryFulfilled, getState }) {
                type PatchResult = { undo: () => void };
                const patchResults: PatchResult[] = [];

                // Find all cached getProductsByBusiness queries for this business and patch them
                const state = getState() as unknown as { api: { queries: Record<string, { endpointName?: string; originalArgs?: { businessId: string; page?: number; limit?: number }; data?: PaginatedProductResponse }> } };
                const queries = state.api?.queries ?? {};

                for (const entry of Object.values(queries)) {
                    if (
                        entry?.endpointName === 'getProductsByBusiness' &&
                        entry.originalArgs?.businessId === businessId
                    ) {
                        patchResults.push(
                            dispatch(
                                productApi.util.updateQueryData(
                                    'getProductsByBusiness',
                                    entry.originalArgs,
                                    (draft) => {
                                        const product = draft.items.find((p) => p.id === productId);
                                        if (product) {
                                            Object.assign(product, data);
                                        }
                                    },
                                ),
                            ),
                        );
                    }
                }

                // Optimistically update getProductById cache
                patchResults.push(
                    dispatch(
                        productApi.util.updateQueryData('getProductById', productId, (draft) => {
                            Object.assign(draft, data);
                        }),
                    ),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchResults.forEach((patch) => patch.undo());
                }
            },
            invalidatesTags: (result, error, { productId }) => [
                { type: 'Products', id: productId },
                { type: 'Products', id: 'LIST' }
            ],
        }),
        deleteProduct: builder.mutation<void, { businessId: string; productId: string }>({
            query: ({ businessId, productId }) => ({
                url: `/api/v1/products/business/${businessId}/${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Products', id: 'LIST' }],
        }),
        getCategories: builder.query<Category[], { hasProductsOnly: boolean }>({
            query: (params) => ({
                url: '/api/v1/categories',
                method: 'GET',
                params
            }),
        }),
        getCategoryById: builder.query<Category, string>({
            query: (id) => ({
                url: `/api/v1/categories/${id}`,
                method: 'GET',
            }),
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetRecommendationsQuery,
    useGetRecommendationsV2Query,
    useGetProductsQuery,
    useGetProductsByBusinessQuery,
    useGetProductByIdQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
    useGetCategoriesQuery,
    useGetCategoryByIdQuery
} = productApi;
