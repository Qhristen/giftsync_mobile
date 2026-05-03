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
                const { page, ...other } = (queryArgs as any) || {};
                return `${endpointName}-${JSON.stringify(other)}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                const params = arg as { page?: number } | undefined;
                if (!params || params.page === 1) {
                    return newItems;
                }
                
                newItems.items.forEach(newItem => {
                    const index = currentCache.items.findIndex(item => item.id === newItem.id);
                    if (index !== -1) {
                        currentCache.items[index] = newItem;
                    } else {
                        currentCache.items.push(newItem);
                    }
                });
                
                currentCache.meta = newItems.meta;
            },
            forceRefetch: ({ currentArg, previousArg, endpointState }) => {
                return (currentArg as any)?.page !== (previousArg as any)?.page || endpointState?.status === 'uninitialized';
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map(({ id }) => ({ type: 'Contacts' as const, id })),
                        { type: 'Contacts', id: 'LIST' },
                    ]
                    : [{ type: 'Contacts', id: 'LIST' }],
        }),
        createContact: builder.mutation<Contact, CreateContactDto>({
            query: (data) => ({
                url: '/api/v1/contacts',
                method: 'POST',
                data,
            }),
            invalidatesTags: [{ type: 'Contacts', id: 'LIST' }],
        }),
        bulkImportContacts: builder.mutation<void, CreateContactDto[]>({
            query: (contacts) => ({
                url: '/api/v1/contacts/bulk',
                method: 'POST',
                data: { contacts },
            }),
            invalidatesTags: [{ type: 'Contacts', id: 'LIST' }],
        }),
        updateContact: builder.mutation<Contact, { id: string; data: UpdateContactDto }>({
            query: ({ id, data }) => ({
                url: `/api/v1/contacts/${id}`,
                method: 'PATCH',
                data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Contacts', id: 'LIST' },
                { type: 'Contacts', id }
            ],
        }),
        getContact: builder.query<Contact, string>({
            query: (id) => ({
                url: `/api/v1/contacts/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Contacts', id }],
        }),
        getContactByTemplateId: builder.query<Contact[], string>({
            query: (id) => ({
                url: `/api/v1/contacts/template/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Contacts', id }],
        }),
        deleteContact: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/v1/contacts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Contacts', id: 'LIST' }],
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
    useGetContactByTemplateIdQuery
} = contactsApi;
