import { Contact, CreateContactDto, PaginatedContactResponse, UpdateContactDto } from '@/types';
import { baseApi } from './baseApi';

export const contactsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getContacts: builder.query<PaginatedContactResponse, { page?: number; limit?: number;[key: string]: unknown }>({
            query: (params) => ({
                url: '/api/v1/contacts',
                method: 'GET',
                params
            }),
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                const queryArgsCopy = queryArgs || {};
                delete queryArgsCopy.page;
                return `${endpointName}-${JSON.stringify(queryArgsCopy)}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                const params = arg;
                if (!params || params.page === 1) {
                    return newItems;
                }
                const existingIds = new Set(currentCache.items.map(item => item.id));
                currentCache.items.push(
                    ...newItems.items.filter(item => !existingIds.has(item.id))
                );
                currentCache.meta = newItems.meta;
            },
            forceRefetch: ({ currentArg, previousArg }) => {
                const curr = currentArg as any;
                const prev = previousArg as any;
                return curr?.page !== prev?.page;
            },
            providesTags: ['Contacts'],
        }),
        createContact: builder.mutation<Contact, CreateContactDto>({
            query: (data) => ({
                url: '/api/v1/contacts',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['Contacts'],
        }),
        bulkImportContacts: builder.mutation<void, CreateContactDto[]>({
            query: (contacts) => ({
                url: '/api/v1/contacts/bulk',
                method: 'POST',
                data: { contacts },
            }),
            invalidatesTags: ['Contacts'],
        }),
        updateContact: builder.mutation<Contact, { id: string; data: UpdateContactDto }>({
            query: ({ id, data }) => ({
                url: `/api/v1/contacts/${id}`,
                method: 'PATCH',
                data,
            }),
            invalidatesTags: (result, error, { id }) => ['Contacts', { type: 'Contacts', id }],
        }),
        getContact: builder.query<Contact, string>({
            query: (id) => ({
                url: `/api/v1/contacts/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Contacts', id }],
        }),
        deleteContact: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/v1/contacts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Contacts'],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetContactsQuery,
    useGetContactQuery,
    useCreateContactMutation,
    useBulkImportContactsMutation,
    useUpdateContactMutation,
    useDeleteContactMutation,
} = contactsApi;
