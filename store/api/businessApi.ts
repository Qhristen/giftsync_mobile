import { Business, CreateBusinessDto, CreateReviewDto, PaginatedReviewResponse, Review, UpdateBusinessDto } from "@/types";
import { baseApi } from "./baseApi";

export const businessApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBusiness: builder.query<Business, void>({
            query: () => ({ url: "/api/v1/businesses/me", method: "GET" }),
            providesTags: ["Business"],
        }),
        createBusiness: builder.mutation<Business, CreateBusinessDto>({
            query: (data) => ({
                url: "/api/v1/businesses",
                method: "POST",
                data,
            }),
            invalidatesTags: ["Business", "UserProfile"],
        }),
        updateBusiness: builder.mutation<Business, UpdateBusinessDto>({
            query: (data) => ({
                url: "/api/v1/businesses/me",
                method: "PATCH",
                data,
            }),
            invalidatesTags: ["Business", "UserProfile"],
        }),
        getBusinessReviews: builder.query<PaginatedReviewResponse, { businessId: string; page?: number; limit?: number }>({
            query: ({ businessId, page = 1, limit = 10 }) => ({
                url: `/api/v1/businesses/${businessId}/reviews`,
                method: "GET",
                params: { page, limit },
            }),
            providesTags: (result, error, arg) =>
                result
                    ? [
                        ...result.items.map(({ id }) => ({ type: 'Review' as const, id })),
                        { type: 'Review', id: `LIST-${arg.businessId}` },
                    ]
                    : [{ type: 'Review', id: `LIST-${arg.businessId}` }],
        }),
        addReview: builder.mutation<Review, { businessId: string } & CreateReviewDto>({
            query: ({ businessId, ...data }) => ({
                url: `/api/v1/businesses/${businessId}/reviews`,
                method: "POST",
                data,
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Review', id: `LIST-${arg.businessId}` }
            ],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetBusinessQuery,
    useCreateBusinessMutation,
    useUpdateBusinessMutation,
    useGetBusinessReviewsQuery,
    useAddReviewMutation,
} = businessApi;
