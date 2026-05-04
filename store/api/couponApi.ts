import { ValidateCouponDto, ValidateCouponResponse } from '@/types';
import { baseApi } from './baseApi';

export const couponApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        validateCoupon: builder.mutation<ValidateCouponResponse, ValidateCouponDto>({
            query: (data) => ({
                url: '/api/v1/coupons/validate',
                method: 'POST',
                data,
            }),
        }),
    }),
    overrideExisting: true,
});

export const { useValidateCouponMutation } = couponApi;
