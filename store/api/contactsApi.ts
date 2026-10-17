import { Contact, CreateContactDto, PaginatedContactResponse, UpdateContactDto } from '@/types';
import { baseApi } from './baseApi';
import { createOptimisticId, getCachedQueryArgs, OptimisticPatch, undoOptimisticPatches } from './optimistic';

type ContactsQueryArgs = { page?: number; limit?: number; [key: string]: unknown };

const patchContactLists = (
    dispatch: any,
    getState: () => unknown,
    recipe: (draft: PaginatedContactResponse) => void,
) => getCachedQueryArgs<ContactsQueryArgs>(getState(), 'getContacts').map((args) =>
    dispatch(contactsApi.util.updateQueryData('getContacts', args, recipe)),
);

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
            async onQueryStarted(data, { dispatch, getState, queryFulfilled }) {
                const now = new Date().toISOString();
                const tempId = createOptimisticId('contact');
                const optimisticContact: Contact = {
                    ...data,
                    id: tempId,
                    userId: 'optimistic',
                    createdAt: now,
                    updatedAt: now,
                };
                const patches = patchContactLists(dispatch, getState, (draft) => {
                    draft.items.unshift(optimisticContact);
                    draft.meta.total += 1;
                });

                try {
                    const { data: savedContact } = await queryFulfilled;
                    patchContactLists(dispatch, getState, (draft) => {
                        const index = draft.items.findIndex((contact) => contact.id === tempId);
                        if (index !== -1) draft.items[index] = savedContact;
                    });
                    dispatch(contactsApi.util.upsertQueryData('getContact', savedContact.id, savedContact));
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
        }),
        bulkImportContacts: builder.mutation<void, CreateContactDto[]>({
            query: (contacts) => ({
                url: '/api/v1/contacts/bulk',
                method: 'POST',
                data: { contacts },
            }),
            invalidatesTags: [{ type: 'Contacts', id: 'LIST' }],
            async onQueryStarted(contacts, { dispatch, getState, queryFulfilled }) {
                const now = new Date().toISOString();
                const optimisticContacts: Contact[] = contacts.map((contact, index) => ({
                    ...contact,
                    id: createOptimisticId(`contact-${index}`),
                    userId: 'optimistic',
                    createdAt: now,
                    updatedAt: now,
                }));
                const patches = patchContactLists(dispatch, getState, (draft) => {
                    draft.items.unshift(...optimisticContacts);
                    draft.meta.total += optimisticContacts.length;
                });

                try {
                    await queryFulfilled;
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
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
            async onQueryStarted({ id, data }, { dispatch, getState, queryFulfilled }) {
                const patches: OptimisticPatch[] = patchContactLists(dispatch, getState, (draft) => {
                    const contact = draft.items.find((item) => item.id === id);
                    if (contact) Object.assign(contact, data, { updatedAt: new Date().toISOString() });
                });
                patches.push(dispatch(
                    contactsApi.util.updateQueryData('getContact', id, (draft) => {
                        Object.assign(draft, data, { updatedAt: new Date().toISOString() });
                    }),
                ));
                for (const templateId of getCachedQueryArgs<string>(getState(), 'getContactByTemplateId')) {
                    patches.push(dispatch(
                        contactsApi.util.updateQueryData('getContactByTemplateId', templateId, (draft) => {
                            const contact = draft.find((item) => item.id === id);
                            if (contact) Object.assign(contact, data, { updatedAt: new Date().toISOString() });
                        }),
                    ));
                }

                try {
                    const { data: savedContact } = await queryFulfilled;
                    dispatch(contactsApi.util.upsertQueryData('getContact', id, savedContact));
                    patchContactLists(dispatch, getState, (draft) => {
                        const index = draft.items.findIndex((contact) => contact.id === id);
                        if (index !== -1) draft.items[index] = savedContact;
                    });
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
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
            async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
                const patches: OptimisticPatch[] = patchContactLists(dispatch, getState, (draft) => {
                    const index = draft.items.findIndex((contact) => contact.id === id);
                    if (index !== -1) {
                        draft.items.splice(index, 1);
                        draft.meta.total = Math.max(0, draft.meta.total - 1);
                    }
                });
                for (const templateId of getCachedQueryArgs<string>(getState(), 'getContactByTemplateId')) {
                    patches.push(dispatch(
                        contactsApi.util.updateQueryData('getContactByTemplateId', templateId, (draft) => {
                            const index = draft.findIndex((contact) => contact.id === id);
                            if (index !== -1) draft.splice(index, 1);
                        }),
                    ));
                }

                try {
                    await queryFulfilled;
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
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
