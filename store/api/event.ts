import { Contact, CreateEventDto, Event, EventTemplate, PaginationMeta, SubscribeEventDto, UpdateEventDto } from '@/types';
import { baseApi } from './baseApi';
import { createOptimisticId, getCachedQueryArgs, OptimisticPatch, undoOptimisticPatches } from './optimistic';

type MonthlyEventArgs = { month: number; year: number };

const eventMatchesMonth = (date: string, args: MonthlyEventArgs) => {
    const parsed = new Date(date);
    return parsed.getMonth() + 1 === args.month && parsed.getFullYear() === args.year;
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
                    const { data: savedEvent } = await queryFulfilled;
                    dispatch(eventApi.util.upsertQueryData('getEventDetail', savedEvent.id, savedEvent));
                    dispatch(eventApi.util.updateQueryData('getMonthlyEvents', { month, year }, (draft) => {
                        const index = draft.items.findIndex((event) => event.id === tempId);
                        if (index !== -1) draft.items[index] = savedEvent;
                    }));
                    dispatch(eventApi.util.updateQueryData('getUpcomingEvents', undefined, (draft) => {
                        const index = draft.findIndex((event) => event.id === tempId);
                        if (index !== -1) draft[index] = { ...savedEvent, contacts: [] };
                    }));
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
            async onQueryStarted({ templateId, contactIds }, { dispatch, getState, queryFulfilled }) {
                const template = eventApi.endpoints.getEventTemplates.select()(getState() as any).data
                    ?.find((item) => item.id === templateId);
                if (!template) {
                    await queryFulfilled.catch(() => undefined);
                    return;
                }

                const now = new Date();
                let year = now.getFullYear();
                const templateDate = new Date(year, template.month - 1, template.day);
                if (templateDate < now) year += 1;
                const date = new Date(year, template.month - 1, template.day).toISOString();
                const createdAt = new Date().toISOString();
                const optimisticEvents = contactIds.map((contactId, index): Event => ({
                    id: createOptimisticId(`event-subscription-${index}`),
                    userId: 'optimistic',
                    contactId,
                    templateId,
                    title: template.title,
                    date,
                    recurrenceType: template.recurrence,
                    source: 'template',
                    createdAt,
                    updatedAt: createdAt,
                }));
                const patches: OptimisticPatch[] = [
                    dispatch(eventApi.util.updateQueryData('getUpcomingEvents', undefined, (draft) => {
                        draft.push(...optimisticEvents.map((event) => ({ ...event, contacts: [] })));
                        draft.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    })),
                ];
                for (const args of getCachedQueryArgs<MonthlyEventArgs>(getState(), 'getMonthlyEvents')) {
                    if (!eventMatchesMonth(date, args)) continue;
                    patches.push(dispatch(eventApi.util.updateQueryData('getMonthlyEvents', args, (draft) => {
                        draft.items.push(...optimisticEvents);
                        draft.items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    })));
                }

                try {
                    const { data: savedEvent } = await queryFulfilled;
                    dispatch(eventApi.util.upsertQueryData('getEventDetail', savedEvent.id, savedEvent));
                    dispatch(eventApi.util.updateQueryData('getUpcomingEvents', undefined, (draft) => {
                        const index = draft.findIndex((event) => event.id === optimisticEvents[0]?.id);
                        if (index !== -1) draft[index] = { ...savedEvent, contacts: [] };
                    }));
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
        }),
        updateEvent: builder.mutation<Event, { id: string; data: UpdateEventDto }>({
            query: ({ id, data }) => ({
                url: `/api/v1/Events/${id}`,
                method: 'PATCH',
                data,
            }),
            invalidatesTags: (result, error, { id }) => ['Events', { type: 'Events', id }],
            async onQueryStarted({ id, data }, { dispatch, getState, queryFulfilled }) {
                const state = getState();
                let previousEvent = eventApi.endpoints.getEventDetail.select(id)(state as any).data;
                const monthlyArgs = getCachedQueryArgs<MonthlyEventArgs>(state, 'getMonthlyEvents');
                if (!previousEvent) {
                    for (const args of monthlyArgs) {
                        previousEvent = eventApi.endpoints.getMonthlyEvents.select(args)(state as any).data?.items.find((event) => event.id === id);
                        if (previousEvent) break;
                    }
                }
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

                const optimisticEvent = previousEvent ? { ...previousEvent, ...data } : undefined;
                const patchesMonthly = monthlyArgs.map(key =>
                    dispatch(
                        eventApi.util.updateQueryData('getMonthlyEvents', key, (draft) => {
                            const index = draft.items.findIndex(o => o.id === id);
                            const matches = optimisticEvent ? eventMatchesMonth(optimisticEvent.date, key) : index !== -1;
                            if (index !== -1 && matches) {
                                Object.assign(draft.items[index], data);
                                draft.items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                            } else if (index !== -1 && !matches) {
                                draft.items.splice(index, 1);
                            } else if (index === -1 && matches && optimisticEvent) {
                                draft.items.push(optimisticEvent);
                                draft.items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                            }
                        })
                    )
                );

                try {
                    const { data: savedEvent } = await queryFulfilled;
                    dispatch(eventApi.util.upsertQueryData('getEventDetail', id, savedEvent));
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
            async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
                const patchUpcoming = dispatch(
                    eventApi.util.updateQueryData('getUpcomingEvents', undefined, (draft) => {
                        const index = draft.findIndex(o => o.id === id);
                        if (index !== -1) draft.splice(index, 1);
                    })
                );

                const patchesMonthly = getCachedQueryArgs<MonthlyEventArgs>(getState(), 'getMonthlyEvents').map(key =>
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
