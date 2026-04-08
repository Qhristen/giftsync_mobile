import { Address, CreateAddressDto, UpdateAddressDto } from '@/types';
import { baseApi } from './baseApi';

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
        }),
        updateAddress: builder.mutation<Address, { id: string; data: UpdateAddressDto }>({
            query: ({ id, data }) => ({
                url: `/api/v1/addresses/${id}`,
                method: 'PATCH',
                data,
            }),
            invalidatesTags: (result, error, { id }) => ['Addresses', { type: 'Addresses', id }],
        }),
        deleteAddress: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/v1/addresses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Addresses'],
        }),
        setDefaultAddress: builder.mutation<Address, string>({
            query: (id) => ({
                url: `/api/v1/addresses/${id}/default`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Addresses'],
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
