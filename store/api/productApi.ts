import { Category, CreateProductDto, PaginatedProductResponse, Product } from '@/types';
import { baseApi } from './baseApi';

export const productApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
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
        getProducts: builder.query<PaginatedProductResponse, { categoryId?: string; search?: string; page?: number; limit?: number } | void>({
            query: (params) => ({
                url: '/api/v1/products',
                method: 'GET',
                params,
            }),
            providesTags: ['Products'],
        }),
        getProductsByBusiness: builder.query<Product[], string>({
            query: (businessId) => ({
                url: `/api/v1/products/business/${businessId}`,
                method: 'GET',
            }),
            providesTags: ['Products'],
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
            invalidatesTags: ['Products'],
        }),
        deleteProduct: builder.mutation<void, { businessId: string; productId: string }>({
            query: ({ businessId, productId }) => ({
                url: `/api/v1/products/business/${businessId}/${productId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Products'],
        }),
        getCategories: builder.query<Category[], void>({
            query: () => ({
                url: '/api/v1/categories',
                method: 'GET',
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
    useDeleteProductMutation,
    useGetCategoriesQuery,
    useGetCategoryByIdQuery
} = productApi;
