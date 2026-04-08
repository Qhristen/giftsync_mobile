import { Business, CreateBusinessDto, UpdateBusinessDto } from "@/types";
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
    }),
    overrideExisting: true,
});

export const {
    useGetBusinessQuery,
    useCreateBusinessMutation,
    useUpdateBusinessMutation,
} = businessApi;
