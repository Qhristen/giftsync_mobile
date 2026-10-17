import { Category, CreateProductDto, PaginatedProductResponse, Product, UpdateProductDto } from '@/types';
import { baseApi } from './baseApi';
import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import { createOptimisticId, getCachedQueryArgs, OptimisticPatch, undoOptimisticPatches } from './optimistic';

type ProductsQueryArgs = { page?: number; limit?: number; [key: string]: unknown };
type BusinessProductsQueryArgs = { businessId: string; page?: number; limit?: number };

const productMatchesQuery = (product: Product, args: ProductsQueryArgs) => {
    if (args.categoryId && args.categoryId !== product.category.id) return false;
    const search = typeof args.search === 'string' ? args.search.trim().toLowerCase() : '';
    if (search && !`${product.name} ${product.description ?? ''}`.toLowerCase().includes(search)) return false;
    if (typeof args.minPrice === 'number' && product.price < args.minPrice) return false;
    if (typeof args.maxPrice === 'number' && product.price > args.maxPrice) return false;
    return true;
};

const patchProductLists = (
    dispatch: any,
    getState: () => unknown,
    endpointName: 'getProducts' | 'getProductsByBusiness',
    recipe: (draft: PaginatedProductResponse) => void,
    businessId?: string,
) => {
    const args = endpointName === 'getProducts'
        ? getCachedQueryArgs<ProductsQueryArgs>(getState(), endpointName)
        : getCachedQueryArgs<BusinessProductsQueryArgs>(getState(), endpointName)
            .filter((query) => !businessId || query.businessId === businessId);

    return args.map((queryArgs) => dispatch(
        productApi.util.updateQueryData(endpointName, queryArgs as any, recipe),
    ));
};

export const productApi = baseApi.injectEndpoints({
    endpoints: (builder: EndpointBuilder<any, string, string>) => ({
        getRecommendations: builder.query<Product[], { contactId?: string; eventId?: string }>({
            query: (params) => ({
                url: '/api/v1/recommendations',
                method: 'GET',
                params,
            }),
            providesTags: ['Recommendations'],
        }),
        getRecommendationsV2: builder.query<Product[], { eventId: string; limit?: number }>({
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
            async onQueryStarted({ businessId, data }, { dispatch, getState, queryFulfilled }) {
                const tempId = createOptimisticId('product');
                const state = getState() as { auth?: { user?: { business?: Product['business'] } } };
                const optimisticProduct = {
                    ...data,
                    id: tempId,
                    businessId,
                    currency: data.currency ?? 'NGN',
                    category: { id: data.categoryId, name: '' },
                    tags: data.tags ?? [],
                    ratingAvg: 0,
                    ratingCount: 0,
                    isAvailable: data.isAvailable ?? true,
                    deliveryDays: data.deliveryDays ?? 0,
                    business: state.auth?.user?.business,
                } as Product;
                const globalListPatches = getCachedQueryArgs<ProductsQueryArgs>(getState(), 'getProducts')
                    .filter((args) => productMatchesQuery(optimisticProduct, args))
                    .map((args) => dispatch(productApi.util.updateQueryData('getProducts', args, (draft) => {
                        draft.items.unshift(optimisticProduct);
                        draft.meta.total += 1;
                    })));
                const patches: OptimisticPatch[] = [
                    ...patchProductLists(dispatch, getState, 'getProductsByBusiness', (draft) => {
                        draft.items.unshift(optimisticProduct);
                        draft.meta.total += 1;
                    }, businessId),
                    ...globalListPatches,
                ];

                try {
                    const { data: savedProduct } = await queryFulfilled;
                    for (const endpointName of ['getProductsByBusiness', 'getProducts'] as const) {
                        patchProductLists(dispatch, getState, endpointName, (draft) => {
                            const index = draft.items.findIndex((product) => product.id === tempId);
                            if (index !== -1) draft.items[index] = savedProduct;
                        }, businessId);
                    }
                    dispatch(productApi.util.upsertQueryData('getProductById', savedProduct.id, savedProduct));
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
        }),
        updateProduct: builder.mutation<Product, { businessId: string; productId: string; data: UpdateProductDto }>({
            query: ({ businessId, productId, data }) => ({
                url: `/api/v1/products/business/${businessId}/${productId}`,
                method: 'PATCH',
                data,
            }),
            async onQueryStarted({ businessId, productId, data }, { dispatch, queryFulfilled, getState }) {
                const patchResults: OptimisticPatch[] = [
                    ...patchProductLists(dispatch, getState, 'getProductsByBusiness', (draft) => {
                        const product = draft.items.find((item) => item.id === productId);
                        if (product) Object.assign(product, data);
                    }, businessId),
                    ...patchProductLists(dispatch, getState, 'getProducts', (draft) => {
                        const product = draft.items.find((item) => item.id === productId);
                        if (product) Object.assign(product, data);
                    }),
                    dispatch(
                        productApi.util.updateQueryData('getProductById', productId, (draft) => {
                            Object.assign(draft, data);
                        }),
                    ),
                ];

                try {
                    const { data: savedProduct } = await queryFulfilled;
                    dispatch(productApi.util.upsertQueryData('getProductById', productId, savedProduct));
                    for (const endpointName of ['getProductsByBusiness', 'getProducts'] as const) {
                        patchProductLists(dispatch, getState, endpointName, (draft) => {
                            const index = draft.items.findIndex((product) => product.id === productId);
                            if (index !== -1) draft.items[index] = savedProduct;
                        }, businessId);
                    }
                } catch {
                    undoOptimisticPatches(patchResults);
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
            async onQueryStarted({ businessId, productId }, { dispatch, getState, queryFulfilled }) {
                const removeProduct = (draft: PaginatedProductResponse) => {
                    const index = draft.items.findIndex((product) => product.id === productId);
                    if (index !== -1) {
                        draft.items.splice(index, 1);
                        draft.meta.total = Math.max(0, draft.meta.total - 1);
                    }
                };
                const patches: OptimisticPatch[] = [
                    ...patchProductLists(dispatch, getState, 'getProductsByBusiness', removeProduct, businessId),
                    ...patchProductLists(dispatch, getState, 'getProducts', removeProduct),
                    ...getCachedQueryArgs<{ contactId?: string; eventId?: string }>(getState(), 'getRecommendations').map((args) =>
                        dispatch(productApi.util.updateQueryData('getRecommendations', args, (draft) => {
                            const index = draft.findIndex((product) => product.id === productId);
                            if (index !== -1) draft.splice(index, 1);
                        })),
                    ),
                    ...getCachedQueryArgs<{ eventId: string; limit?: number }>(getState(), 'getRecommendationsV2').map((args) =>
                        dispatch(productApi.util.updateQueryData('getRecommendationsV2', args, (draft) => {
                            const index = draft.findIndex((product) => product.id === productId);
                            if (index !== -1) draft.splice(index, 1);
                        })),
                    ),
                ];

                try {
                    await queryFulfilled;
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
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
