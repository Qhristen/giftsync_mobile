import { Business, CreateBusinessDto, CreateReviewDto, PaginatedReviewResponse, Review, UpdateBusinessDto } from "@/types";
import { setCredentials } from "../slices/authSlice";
import { baseApi } from "./baseApi";
import { createOptimisticId, getCachedQueryArgs, OptimisticPatch, undoOptimisticPatches } from "./optimistic";

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
            async onQueryStarted(data, { dispatch, getState, queryFulfilled }) {
                const previousUser = (getState() as unknown as { auth: { user: Business['user'] | null } }).auth.user;
                const optimisticBusiness = {
                    ...data,
                    id: createOptimisticId('business'),
                    userId: previousUser?.id ?? 'optimistic',
                    user: previousUser,
                    ratingAvg: 0,
                    ratingCount: 0,
                    isVerified: false,
                    isRegistered: data.isRegistered ?? false,
                } as Business;
                dispatch(businessApi.util.upsertQueryData('getBusiness', undefined, optimisticBusiness));
                if (previousUser) {
                    dispatch(setCredentials({ user: { ...previousUser, business: optimisticBusiness } }));
                }

                try {
                    const { data: savedBusiness } = await queryFulfilled;
                    dispatch(businessApi.util.upsertQueryData('getBusiness', undefined, savedBusiness));
                    if (previousUser) {
                        dispatch(setCredentials({ user: { ...previousUser, business: savedBusiness } }));
                    }
                } catch {
                    if (previousUser) dispatch(setCredentials({ user: previousUser }));
                    dispatch(businessApi.util.invalidateTags(['Business']));
                }
            },
        }),
        updateBusiness: builder.mutation<Business, UpdateBusinessDto>({
            query: (data) => ({
                url: "/api/v1/businesses/me",
                method: "PATCH",
                data,
            }),
            invalidatesTags: ["Business", "UserProfile"],
            async onQueryStarted(data, { dispatch, getState, queryFulfilled }) {
                const previousUser = (getState() as unknown as { auth: { user: Business['user'] | null } }).auth.user;
                const optimisticBusiness = previousUser?.business
                    ? { ...previousUser.business, ...data }
                    : null;
                const patch = dispatch(
                    businessApi.util.updateQueryData('getBusiness', undefined, (draft) => {
                        Object.assign(draft, data);
                    }),
                );
                if (previousUser && optimisticBusiness) {
                    dispatch(setCredentials({ user: { ...previousUser, business: optimisticBusiness } }));
                }

                try {
                    const { data: savedBusiness } = await queryFulfilled;
                    dispatch(businessApi.util.upsertQueryData('getBusiness', undefined, savedBusiness));
                    if (previousUser) {
                        dispatch(setCredentials({ user: { ...previousUser, business: savedBusiness } }));
                    }
                } catch {
                    patch.undo();
                    if (previousUser) dispatch(setCredentials({ user: previousUser }));
                }
            },
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
            async onQueryStarted({ businessId, ...data }, { dispatch, getState, queryFulfilled }) {
                const user = (getState() as unknown as { auth: { user: Business['user'] | null } }).auth.user;
                const tempId = createOptimisticId('review');
                const optimisticReview: Review = {
                    id: tempId,
                    businessId,
                    userId: user?.id ?? 'optimistic',
                    rating: data.rating,
                    comment: data.comment,
                    createdAt: new Date().toISOString(),
                    ...(user ? { user } : {}),
                };
                const patches: OptimisticPatch[] = [];
                for (const args of getCachedQueryArgs<{ businessId: string; page?: number; limit?: number }>(getState(), 'getBusinessReviews')) {
                    if (args.businessId !== businessId) continue;
                    patches.push(dispatch(
                        businessApi.util.updateQueryData('getBusinessReviews', args, (draft) => {
                            draft.items.unshift(optimisticReview);
                            draft.meta.total += 1;
                        }),
                    ));
                }

                try {
                    const { data: savedReview } = await queryFulfilled;
                    for (const args of getCachedQueryArgs<{ businessId: string; page?: number; limit?: number }>(getState(), 'getBusinessReviews')) {
                        if (args.businessId !== businessId) continue;
                        dispatch(businessApi.util.updateQueryData('getBusinessReviews', args, (draft) => {
                            const index = draft.items.findIndex((review) => review.id === tempId);
                            if (index !== -1) draft.items[index] = savedReview;
                        }));
                    }
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
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
