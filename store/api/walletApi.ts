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
        getTransactions: builder.query<PaginatedWalletTransactionResponse, { page?: number; limit?: number;[key: string]: unknown }>({
            query: (params) => ({
                url: '/api/v1/wallet/transactions',
                method: 'GET',
                params: params || {},
            }),
            serializeQueryArgs: ({ endpointName, queryArgs }) => {
                const queryArgsCopy = { ...queryArgs };
                delete queryArgsCopy.page;
                return `${endpointName}-${JSON.stringify(queryArgsCopy)}`;
            },
            merge: (currentCache, newItems, { arg }) => {
                const params = arg as { page?: number } | undefined;
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
                const curr = currentArg as { page?: number } | undefined;
                const prev = previousArg as { page?: number } | undefined;
                return curr?.page !== prev?.page;
            },
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
