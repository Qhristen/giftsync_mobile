import { Contact, CreateContactDto, PaginatedContactResponse, UpdateContactDto } from '@/types';
import { baseApi } from './baseApi';

export const contactsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getContacts: builder.query<PaginatedContactResponse, { page?: number; limit?: number } | void>({
            query: (params) => ({
                url: '/api/v1/contacts',
                method: 'GET',
                params
            }),
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
    useCreateContactMutation,
    useBulkImportContactsMutation,
    useUpdateContactMutation,
    useDeleteContactMutation,
} = contactsApi;
