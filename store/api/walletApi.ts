import { CoinPackage, PaginatedWalletTransactionResponse, WalletBalance } from '@/types';
import { baseApi } from './baseApi';

export const walletApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getWalletBalance: builder.query<WalletBalance, void>({
            query: () => ({ url: '/api/v1/wallet/balance', method: 'GET' }),
            providesTags: ['Wallet'],
        }),
        getCoinPackages: builder.query<CoinPackage[], void>({
            query: () => ({ url: '/api/v1/coin-packages', method: 'GET' }),
            providesTags: ['Wallet'],
        }),
        getTransactions: builder.query<PaginatedWalletTransactionResponse, { page?: number; limit?: number } | void>({
            query: (params) => ({
                url: '/api/v1/wallet/transactions',
                method: 'GET',
                params: params || {},
            }),
            providesTags: ['Wallet'],
        }),
        getCoinQuote: builder.query<{ amount: number; currency: string; coins: number; rate: number }, number>({
            query: (amount) => ({
                url: '/api/v1/wallet/quote',
                method: 'GET',
                params: { amount },
            }),
        }),
    }),
    overrideExisting: true,
});

export const { useGetWalletBalanceQuery, useGetCoinPackagesQuery, useGetTransactionsQuery, useGetCoinQuoteQuery } = walletApi;
