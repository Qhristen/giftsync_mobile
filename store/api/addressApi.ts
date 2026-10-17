import { Address, CreateAddressDto, UpdateAddressDto } from '@/types';
import { baseApi } from './baseApi';
import { createOptimisticId, getCachedQueryArgs, OptimisticPatch, undoOptimisticPatches } from './optimistic';

export const addressApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAddresses: builder.query<Address[], void>({
            query: () => ({
                url: '/api/v1/addresses',
                method: 'GET',
            }),
            providesTags: ['Addresses'],
        }),
        getAddressById: builder.query<Address, string>({
            query: (id) => ({
                url: `/api/v1/addresses/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Addresses', id }],
        }),
        createAddress: builder.mutation<Address, CreateAddressDto>({
            query: (data) => ({
                url: '/api/v1/addresses',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['Addresses'],
            async onQueryStarted(data, { dispatch, queryFulfilled }) {
                const now = new Date().toISOString();
                const tempId = createOptimisticId('address');
                const optimisticAddress: Address = {
                    ...data,
                    id: tempId,
                    userId: 'optimistic',
                    isDefault: data.isDefault ?? false,
                    createdAt: now,
                    updatedAt: now,
                };
                const patch = dispatch(
                    addressApi.util.updateQueryData('getAddresses', undefined, (draft) => {
                        if (optimisticAddress.isDefault) {
                            draft.forEach((address) => { address.isDefault = false; });
                        }
                        draft.unshift(optimisticAddress);
                    }),
                );

                try {
                    const { data: savedAddress } = await queryFulfilled;
                    dispatch(
                        addressApi.util.updateQueryData('getAddresses', undefined, (draft) => {
                            const index = draft.findIndex((address) => address.id === tempId);
                            if (index !== -1) draft[index] = savedAddress;
                        }),
                    );
                } catch {
                    patch.undo();
                }
            },
        }),
        updateAddress: builder.mutation<Address, { id: string; data: UpdateAddressDto }>({
            query: ({ id, data }) => ({
                url: `/api/v1/addresses/${id}`,
                method: 'PATCH',
                data,
            }),
            invalidatesTags: (result, error, { id }) => ['Addresses', { type: 'Addresses', id }],
            async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
                const patches: OptimisticPatch[] = [
                    dispatch(
                        addressApi.util.updateQueryData('getAddresses', undefined, (draft) => {
                            const address = draft.find((item) => item.id === id);
                            if (address) Object.assign(address, data, { updatedAt: new Date().toISOString() });
                            if (data.isDefault) {
                                draft.forEach((item) => { item.isDefault = item.id === id; });
                            }
                        }),
                    ),
                    dispatch(
                        addressApi.util.updateQueryData('getAddressById', id, (draft) => {
                            Object.assign(draft, data, { updatedAt: new Date().toISOString() });
                        }),
                    ),
                ];

                try {
                    const { data: savedAddress } = await queryFulfilled;
                    dispatch(
                        addressApi.util.updateQueryData('getAddresses', undefined, (draft) => {
                            const index = draft.findIndex((address) => address.id === id);
                            if (index !== -1) draft[index] = savedAddress;
                        }),
                    );
                    dispatch(addressApi.util.upsertQueryData('getAddressById', id, savedAddress));
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
        }),
        deleteAddress: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/v1/addresses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Addresses'],
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patch = dispatch(
                    addressApi.util.updateQueryData('getAddresses', undefined, (draft) => {
                        const index = draft.findIndex((address) => address.id === id);
                        if (index !== -1) draft.splice(index, 1);
                    }),
                );

                try {
                    await queryFulfilled;
                } catch {
                    patch.undo();
                }
            },
        }),
        setDefaultAddress: builder.mutation<Address, string>({
            query: (id) => ({
                url: `/api/v1/addresses/${id}/default`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Addresses'],
            async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
                const patches: OptimisticPatch[] = [
                    dispatch(
                        addressApi.util.updateQueryData('getAddresses', undefined, (draft) => {
                            draft.forEach((address) => { address.isDefault = address.id === id; });
                        }),
                    ),
                ];

                for (const cachedId of getCachedQueryArgs<string>(getState(), 'getAddressById')) {
                    patches.push(
                        dispatch(
                            addressApi.util.updateQueryData('getAddressById', cachedId, (draft) => {
                                draft.isDefault = cachedId === id;
                            }),
                        ),
                    );
                }

                try {
                    const { data: savedAddress } = await queryFulfilled;
                    dispatch(addressApi.util.upsertQueryData('getAddressById', id, savedAddress));
                } catch {
                    undoOptimisticPatches(patches);
                }
            },
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetAddressesQuery,
    useGetAddressByIdQuery,
    useCreateAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
    useSetDefaultAddressMutation,
} = addressApi;
