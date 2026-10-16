import { ClientFeatureKey, useGetFeatureManifestQuery } from '@/store/api/featureApi';
import { useEffect } from 'react';
import { AppState } from 'react-native';

const DEFAULT_TTL_SECONDS = 30;
const MIN_TTL_SECONDS = 1;

export const useFeatureFlag = (key: ClientFeatureKey) => {
    const query = useGetFeatureManifestQuery();

    return {
        enabled: query.data?.features[key] ?? true,
        isLoading: query.isLoading,
        isUnavailable: query.isError,
        refetch: query.refetch,
    };
};

export const useFeatureManifestSync = () => {
    const query = useGetFeatureManifestQuery();
    const { refetch } = query;
    const ttlSeconds = Math.max(query.data?.meta.ttlSeconds ?? DEFAULT_TTL_SECONDS, MIN_TTL_SECONDS);

    useEffect(() => {
        let refreshInFlight = false;

        const refreshManifest = async () => {
            if (AppState.currentState !== 'active' || refreshInFlight) return;

            refreshInFlight = true;
            try {
                await refetch();
            } finally {
                refreshInFlight = false;
            }
        };

        const interval = setInterval(() => {
            void refreshManifest();
        }, ttlSeconds * 1000);

        const appStateSubscription = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active') {
                void refreshManifest();
            }
        });

        return () => {
            clearInterval(interval);
            appStateSubscription.remove();
        };
    }, [refetch, ttlSeconds]);

    return query;
};
