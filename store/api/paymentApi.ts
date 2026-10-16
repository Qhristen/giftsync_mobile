import { baseApi } from './baseApi';
import { PaymentGateway } from '@/types';

export interface Bank {
    name: string;
    code: string;
    country: string;
    currency: string;
}

export interface VerifyAccountRequest {
    accountNumber: string;
    bankCode: string;
    gateway?: PaymentGateway;
}

export interface VerifyAccountResponse {
    accountNumber: string;
    accountName: string;
    bankId: number;
}

export const paymentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        listBanks: builder.query<Bank[], PaymentGateway | void>({
            query: (gateway) => ({
                url: '/api/v1/payment/banks',
                method: 'GET',
                params: gateway ? { gateway } : undefined,
            }),
            transformResponse: (response: { data: Bank[] }) => response.data,
        }),
        verifyAccount: builder.mutation<VerifyAccountResponse, VerifyAccountRequest>({
            query: (body) => ({
                url: '/api/v1/payment/verify-account',
                method: 'POST',
                data: body,
            }),
            transformResponse: (response: { data: VerifyAccountResponse }) => response.data,
        }),
    }),
    overrideExisting: true,
});

export const {
    useListBanksQuery,
    useVerifyAccountMutation,
} = paymentApi;
