import { CreateProductDto, PaginatedProductResponse, Product } from '@/types';
import { baseApi } from './baseApi';

export const productApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getRecommendations: builder.query<Product[], { contactId?: string; occasionId?: string }>({
            query: (params) => ({
                url: '/api/v1/recommendations',
                method: 'GET',
                params,
            }),
            providesTags: ['Recommendations' as any],
        }),
        getProducts: builder.query<PaginatedProductResponse, { category?: string; search?: string; page?: number; limit?: number } | void>({
            query: (params) => ({
                url: '/api/v1/products',
                method: 'GET',
                params,
            }),
            providesTags: ['Products' as any],
        }),
        getProductById: builder.query<Product, string>({
            query: (id) => ({
                url: `/api/v1/products/${id}`,
                method: 'GET'
            }),
            providesTags: (result, error, id) => [{ type: 'Products' as any, id }],
        }),
        createProduct: builder.mutation<Product, { businessId: string; data: CreateProductDto }>({
            query: ({ businessId, data }) => ({
                url: `/api/v1/products/business/${businessId}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Products' as any],
        }),
        deleteProduct: builder.mutation<void, { businessId: string; productId: string }>({
            query: ({ businessId, productId }) => ({
                url: `/api/v1/products/business/${businessId}/${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Products' as any],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetRecommendationsQuery,
    useGetProductsQuery,
    useGetProductByIdQuery,
    useCreateProductMutation,
    useDeleteProductMutation
} = productApi;
