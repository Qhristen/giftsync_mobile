import { baseApi } from './baseApi';

export type ClientFeatureKey =
    | 'ai_assistant'
    | 'gift_requests'
    | 'gift_recommendations'
    | 'coupons'
    | 'referrals'
    | 'business_reviews'
    | 'disputes'
    | 'trust_safety'
    | 'business_onboarding';

export type ClientFeatureMap = Record<ClientFeatureKey, boolean>;

export interface ClientFeatureDetail {
    key: ClientFeatureKey;
    label: string;
    description: string;
    group: string;
    enabled: boolean;
    adminPreview: boolean;
}

export interface FeatureManifest {
    features: ClientFeatureMap;
    details: ClientFeatureDetail[];
    meta: {
        generatedAt: string;
        ttlSeconds: number;
    };
}

export const featureApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFeatureManifest: builder.query<FeatureManifest, void>({
            query: () => ({
                url: '/api/v1/features',
                method: 'GET',
            }),
            providesTags: ['FeatureManifest'],
            keepUnusedDataFor: 30,
        }),
    }),
    overrideExisting: true,
});

export const { useGetFeatureManifestQuery } = featureApi;
