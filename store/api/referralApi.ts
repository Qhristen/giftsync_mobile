import { ReferralInfo, ReferralRecord } from '@/types';
import { baseApi } from './baseApi';

export const referralApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getReferralInfo: builder.query<ReferralInfo, void>({
            query: () => ({ url: '/api/v1/referrals/me', method: 'GET' }),
            providesTags: ['ReferralInfo'],
        }),
        getReferralsList: builder.query<ReferralRecord[], void>({
            query: () => ({ url: '/api/v1/referrals/list', method: 'GET' }),
            providesTags: ['ReferralsList'],
        }),
        applyReferralCode: builder.mutation<{ message: string }, { code: string }>({
            query: (data) => ({
                url: '/api/v1/referrals/apply',
                method: 'POST',
                data,
            }),
            invalidatesTags: ['ReferralInfo', 'UserProfile'],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetReferralInfoQuery,
    useGetReferralsListQuery,
    useApplyReferralCodeMutation,
} = referralApi;
