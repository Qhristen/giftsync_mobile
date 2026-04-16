import { CreateOccasionDto, Occasion, PaginationMeta, UpdateOccasionDto } from '@/types';
import { baseApi } from './baseApi';

/**
 * Helper: returns a small set of { month, year } entries near a given date,
 * so we only patch the caches that are likely loaded instead of 36 months.
 */
const getNearbyMonthKeys = (date?: string): { month: number; year: number }[] => {
    const d = date ? new Date(date) : new Date();
    const month = d.getMonth() + 1; // 1-based
    const year = d.getFullYear();

    const keys: { month: number; year: number }[] = [];
    for (let offset = -1; offset <= 1; offset++) {
        let m = month + offset;
        let y = year;
        if (m < 1) { m = 12; y--; }
        if (m > 12) { m = 1; y++; }
        keys.push({ month: m, year: y });
    }
    return keys;
};

export const occasionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUpcomingOccasions: builder.query<Occasion[], void>({
            query: () => ({ url: '/api/v1/occasions/upcoming', method: 'GET' }),
            providesTags: ['Occasions'],
        }),
        getMonthlyOccasions: builder.query<{ items: Occasion[], meta: PaginationMeta }, { month: number; year: number }>({
            query: (params) => ({
                url: '/api/v1/occasions',
                params,
            }),
            providesTags: ['Occasions'],
        }),
        getOccasionDetail: builder.query<Occasion, string>({
            query: (id) => ({ url: `/api/v1/occasions/${id}`, method: 'GET' }),
            providesTags: (result, error, id) => [{ type: 'Occasions', id }],
        }),
        createOccasion: builder.mutation<Occasion, CreateOccasionDto>({
            query: (data) => ({
                url: '/api/v1/occasions',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['Occasions'],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const date = new Date(arg.date);
                const month = date.getMonth() + 1;
                const year = date.getFullYear();

                const tempId = `temp-${Date.now()}`;
                const newOccasion: Occasion = {
                    id: tempId,
                    userId: 'optimistic',
                    contactId: arg.contactId,
                    // recursYearly: false,
                    type: arg.type,
                    date: arg.date,
                    source: 'custom',
                    dotColor: arg.dotColor || 'blue',
                    notes: arg.notes || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                const patchMonthly = dispatch(
                    occasionApi.util.updateQueryData('getMonthlyOccasions', { month, year }, (draft) => {
                        draft.items.push(newOccasion);
                        draft.items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    })
                );

                const patchUpcoming = dispatch(
                    occasionApi.util.updateQueryData('getUpcomingOccasions', undefined, (draft) => {
                        draft.push(newOccasion);
                        draft.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchMonthly.undo();
                    patchUpcoming.undo();
                }
            },
        }),
        updateOccasion: builder.mutation<Occasion, { id: string; data: UpdateOccasionDto }>({
            query: ({ id, data }) => ({
                url: `/api/v1/occasions/${id}`,
                method: 'PATCH',
                data,
            }),
            invalidatesTags: (result, error, { id }) => ['Occasions', { type: 'Occasions', id }],
            async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
                const patchDetail = dispatch(
                    occasionApi.util.updateQueryData('getOccasionDetail', id, (draft) => {
                        Object.assign(draft, data);
                    })
                );

                const patchUpcoming = dispatch(
                    occasionApi.util.updateQueryData('getUpcomingOccasions', undefined, (draft) => {
                        const index = draft.findIndex(o => o.id === id);
                        if (index !== -1) {
                            Object.assign(draft[index], data);
                            draft.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        }
                    })
                );

                // Only patch nearby months instead of 3 years × 12 months
                const nearbyKeys = getNearbyMonthKeys(data.date);
                const patchesMonthly = nearbyKeys.map(key =>
                    dispatch(
                        occasionApi.util.updateQueryData('getMonthlyOccasions', key, (draft) => {
                            const index = draft.items.findIndex(o => o.id === id);
                            if (index !== -1) {
                                Object.assign(draft.items[index], data);
                                draft.items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                            }
                        })
                    )
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchDetail.undo();
                    patchUpcoming.undo();
                    patchesMonthly.forEach(p => p.undo());
                }
            },
        }),
        deleteOccasion: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/v1/occasions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Occasions'],
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchUpcoming = dispatch(
                    occasionApi.util.updateQueryData('getUpcomingOccasions', undefined, (draft) => {
                        const index = draft.findIndex(o => o.id === id);
                        if (index !== -1) draft.splice(index, 1);
                    })
                );

                // Only patch nearby months instead of 3 years × 12 months
                const nearbyKeys = getNearbyMonthKeys();
                const patchesMonthly = nearbyKeys.map(key =>
                    dispatch(
                        occasionApi.util.updateQueryData('getMonthlyOccasions', key, (draft) => {
                            const index = draft.items.findIndex(o => o.id === id);
                            if (index !== -1) draft.items.splice(index, 1);
                        })
                    )
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchUpcoming.undo();
                    patchesMonthly.forEach(p => p.undo());
                }
            },
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetUpcomingOccasionsQuery,
    useGetMonthlyOccasionsQuery,
    useGetOccasionDetailQuery,
    useCreateOccasionMutation,
    useUpdateOccasionMutation,
    useDeleteOccasionMutation,
} = occasionApi;
