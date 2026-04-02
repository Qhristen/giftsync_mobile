import { CoinPackage, WalletBalance } from '@/types';
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
    }),
    overrideExisting: true,
});

export const { useGetWalletBalanceQuery, useGetCoinPackagesQuery } = walletApi;
