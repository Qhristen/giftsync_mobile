import { baseApi } from './baseApi';
import { PaymentGateway } from '@/types';

export interface PlatformConfigItem {
    id?: string;
    key: string;
    value: string;
    description: string;
    updatedAt?: string;
}

export interface DefaultPaymentGatewayResponse {
    gateway: PaymentGateway;
}

export interface UpdateDefaultPaymentGatewayRequest {
    gateway: PaymentGateway;
}

export const platformConfigApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPlatformConfig: builder.query<PlatformConfigItem[], void>({
            query: () => ({
                url: '/api/v1/platform-config',
                method: 'GET',
            }),
            providesTags: ['PlatformConfig'],
        }),
        getDefaultPaymentGateway: builder.query<DefaultPaymentGatewayResponse, void>({
            query: () => ({
                url: '/api/v1/platform-config/payment-gateway/default',
                method: 'GET',
            }),
            providesTags: [{ type: 'PlatformConfig', id: 'DEFAULT_PAYMENT_GATEWAY' }],
        }),
        updateDefaultPaymentGateway: builder.mutation<PlatformConfigItem, UpdateDefaultPaymentGatewayRequest>({
            query: (body) => ({
                url: '/api/v1/platform-config/payment-gateway/default',
                method: 'PATCH',
                data: body,
            }),
            invalidatesTags: [
                'PlatformConfig',
                { type: 'PlatformConfig', id: 'DEFAULT_PAYMENT_GATEWAY' },
            ],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetPlatformConfigQuery,
    useLazyGetPlatformConfigQuery,
    useGetDefaultPaymentGatewayQuery,
    useLazyGetDefaultPaymentGatewayQuery,
    useUpdateDefaultPaymentGatewayMutation,
} = platformConfigApi;
