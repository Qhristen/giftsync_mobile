import { baseApi } from './baseApi';

export interface PlatformConfigItem {
    key: string;
    value: string;
    description: string;
}

export const platformConfigApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPlatformConfig: builder.query<PlatformConfigItem[], void>({
            query: () => ({
                url: '/api/v1/platform-config',
                method: 'GET',
            }),
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetPlatformConfigQuery,
    useLazyGetPlatformConfigQuery,
} = platformConfigApi;
