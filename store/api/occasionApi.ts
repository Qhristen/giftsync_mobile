import { CreateOccasionDto, Occasion, UpdateOccasionDto } from '@/types';
import { baseApi } from './baseApi';

export const occasionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUpcomingOccasions: builder.query<Occasion[], void>({
            query: () => ({ url: '/api/v1/occasions/upcoming', method: 'GET' }),
            providesTags: ['Occasions'],
        }),
        getMonthlyOccasions: builder.query<Occasion[], { month: number; year: number }>({
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
                   recursYearly: false,
                    type: arg.type,
                    date: arg.date,
                    contactNumber: arg.contactNumber,
                    source: 'custom',
                    contactName: arg.contactName,
                    contactAvatar: arg.contactAvatar,
                    dotColor: arg.dotColor,
                    notes: arg.notes || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                const patchMonthly = dispatch(
                    occasionApi.util.updateQueryData('getMonthlyOccasions', { month, year }, (draft) => {
                        draft.push(newOccasion);
                        draft.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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

                const currentYear = new Date().getFullYear();
                const patchesMonthly: any[] = [];
                [currentYear - 1, currentYear, currentYear + 1].forEach(year => {
                    for (let month = 1; month <= 12; month++) {
                        patchesMonthly.push(
                            dispatch(
                                occasionApi.util.updateQueryData('getMonthlyOccasions', { month, year }, (draft) => {
                                    const index = draft.findIndex(o => o.id === id);
                                    if (index !== -1) {
                                        Object.assign(draft[index], data);
                                        draft.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                                    }
                                })
                            )
                        );
                    }
                });

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

                const currentYear = new Date().getFullYear();
                const patchesMonthly: any[] = [];
                [currentYear - 1, currentYear, currentYear + 1].forEach(year => {
                    for (let month = 1; month <= 12; month++) {
                        patchesMonthly.push(
                            dispatch(
                                occasionApi.util.updateQueryData('getMonthlyOccasions', { month, year }, (draft) => {
                                    const index = draft.findIndex(o => o.id === id);
                                    if (index !== -1) draft.splice(index, 1);
                                })
                            )
                        );
                    }
                });

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
