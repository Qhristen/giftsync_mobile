import { Contact, CreateEventDto, Event, EventTemplate, PaginationMeta, SubscribeEventDto, UpdateEventDto } from '@/types';
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

type UpcommingEvent = Event & {
    contacts: Contact[]
}

export const eventApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getEventTemplates: builder.query<EventTemplate[], void>({
            query: () => ({ url: '/api/v1/Events/templates', method: 'GET' }),
            providesTags: ['Events'],
        }),
        getUpcomingEvents: builder.query<UpcommingEvent[], void>({
            query: () => ({ url: '/api/v1/Events/upcoming', method: 'GET' }),
            providesTags: ['Events'],
        }),
        getMonthlyEvents: builder.query<{ items: Event[], meta: PaginationMeta }, { month: number; year: number }>({
            query: (params) => ({
                url: '/api/v1/Events',
                params,
            }),
            providesTags: ['Events'],
        }),
        getEventDetail: builder.query<Event, string>({
            query: (id) => ({ url: `/api/v1/Events/${id}`, method: 'GET' }),
            providesTags: (result, error, id) => [{ type: 'Events', id }],
        }),
        createEvent: builder.mutation<Event, CreateEventDto>({
            query: (data) => ({
                url: '/api/v1/Events',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['Events'],
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                const date = new Date(arg.date);
                const month = date.getMonth() + 1;
                const year = date.getFullYear();

                const tempId = `temp-${Date.now()}`;
                const newEvent: Event = {
                    id: tempId,
                    userId: 'optimistic',
                    title: arg.title,
                    date: arg.date,
                    recurrenceType: arg.recurrenceType || 'YEARLY',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                const patchMonthly = dispatch(
                    eventApi.util.updateQueryData('getMonthlyEvents', { month, year }, (draft) => {
                        draft.items.push(newEvent);
                        draft.items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    })
                );

                const patchUpcoming = dispatch(
                    eventApi.util.updateQueryData('getUpcomingEvents', undefined, (draft) => {
                        draft.push({ ...newEvent, contacts: [] });
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
        subscribeToTemplate: builder.mutation<Event, SubscribeEventDto>({
            query: (data) => ({
                url: '/api/v1/Events/subscribe',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['Events', "Contacts"],
        }),
        updateEvent: builder.mutation<Event, { id: string; data: UpdateEventDto }>({
            query: ({ id, data }) => ({
                url: `/api/v1/Events/${id}`,
                method: 'PATCH',
                data,
            }),
            invalidatesTags: (result, error, { id }) => ['Events', { type: 'Events', id }],
            async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
                const patchDetail = dispatch(
                    eventApi.util.updateQueryData('getEventDetail', id, (draft) => {
                        Object.assign(draft, data);
                    })
                );

                const patchUpcoming = dispatch(
                    eventApi.util.updateQueryData('getUpcomingEvents', undefined, (draft) => {
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
                        eventApi.util.updateQueryData('getMonthlyEvents', key, (draft) => {
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
        deleteEvent: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/v1/Events/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Events'],
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchUpcoming = dispatch(
                    eventApi.util.updateQueryData('getUpcomingEvents', undefined, (draft) => {
                        const index = draft.findIndex(o => o.id === id);
                        if (index !== -1) draft.splice(index, 1);
                    })
                );

                // Only patch nearby months instead of 3 years × 12 months
                const nearbyKeys = getNearbyMonthKeys();
                const patchesMonthly = nearbyKeys.map(key =>
                    dispatch(
                        eventApi.util.updateQueryData('getMonthlyEvents', key, (draft) => {
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
    useGetEventTemplatesQuery,
    useGetUpcomingEventsQuery,
    useGetMonthlyEventsQuery,
    useGetEventDetailQuery,
    useCreateEventMutation,
    useUpdateEventMutation,
    useDeleteEventMutation,
    useSubscribeToTemplateMutation,
} = eventApi;
