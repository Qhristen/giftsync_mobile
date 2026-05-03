import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { toast } from 'sonner-native';

type NetworkStatus = 'online' | 'slow' | 'offline';

// Google's connectivity check — lightweight, globally available
const CONNECTIVITY_CHECK_URL = 'https://clients3.google.com/generate_204';

const SLOW_THRESHOLD_MS = 3000;  // response time above 3s = slow
const PING_TIMEOUT_MS = 10000;   // abort after 10s
const SLOW_CHECK_INTERVAL_MS = 60000; // check for slowness every 60s

/**
 * Monitors network connectivity and quality.
 * Uses @react-native-community/netinfo for instant offline/online detection,
 * and a periodic fetch ping to detect slow connections.
 * 
 * Shows sonner-native toast notifications when status changes.
 */
export function useNetworkStatus() {
    const [status, setStatus] = useState<NetworkStatus>('online');
    const lastToastId = useRef<string | number | undefined>(undefined);
    const previousStatus = useRef<NetworkStatus>('online');
    const slowCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    /** Measures actual latency to detect slow connections */
    const measureLatency = async (): Promise<'online' | 'slow'> => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
        const start = Date.now();

        try {
            await fetch(CONNECTIVITY_CHECK_URL, {
                method: 'HEAD',
                cache: 'no-store',
                signal: controller.signal,
            });

            clearTimeout(timeout);
            const duration = Date.now() - start;
            return duration > SLOW_THRESHOLD_MS ? 'slow' : 'online';
        } catch {
            clearTimeout(timeout);
            return 'slow'; // if fetch fails but NetInfo says connected → slow
        }
    };

    const showToast = (newStatus: NetworkStatus) => {
        // Dismiss previous network toast
        if (lastToastId.current !== undefined) {
            toast.dismiss(lastToastId.current);
            lastToastId.current = undefined;
        }

        if (newStatus === 'offline') {
            lastToastId.current = toast.error('You\'re offline', {
                description: 'Check your internet connection and try again.',
                duration: Infinity, // persist until connectivity is restored
                icon: '📡',
            });
        } else if (newStatus === 'slow') {
            lastToastId.current = toast.warning('Slow connection', {
                description: 'Your network is slow. Some features may take longer.',
                duration: 6000,
                icon: '🐢',
            });
        } else if (previousStatus.current !== 'online' && newStatus === 'online') {
            lastToastId.current = toast.success('Back online', {
                description: 'Your connection has been restored.',
                duration: 3000,
                icon: '✅',
            });
        }
    };

    const updateStatus = (newStatus: NetworkStatus) => {
        if (newStatus !== previousStatus.current) {
            setStatus(newStatus);
            showToast(newStatus);
            previousStatus.current = newStatus;
        }
    };

    /** Handle NetInfo state changes (instant offline/online detection) */
    const handleNetInfoChange = async (state: NetInfoState) => {
        if (!state.isConnected || !state.isInternetReachable) {
            updateStatus('offline');
            return;
        }

        // Device says it's connected — verify quality with a latency check
        const quality = await measureLatency();
        updateStatus(quality);
    };

    /** Periodic slow-network check (runs only when "online") */
    const runSlowCheck = async () => {
        if (previousStatus.current === 'offline') return; // skip if already offline

        const quality = await measureLatency();
        updateStatus(quality);
    };

    useEffect(() => {
        // Subscribe to OS-level network state changes
        const unsubscribe = NetInfo.addEventListener(handleNetInfoChange);

        // Initial fetch after a short delay to let the app settle
        const initialTimeout = setTimeout(async () => {
            const state = await NetInfo.fetch();
            handleNetInfoChange(state);
        }, 3000);

        // Periodic latency checks for slow detection
        slowCheckInterval.current = setInterval(runSlowCheck, SLOW_CHECK_INTERVAL_MS);

        // Re-check when app returns to foreground
        const handleAppStateChange = (nextState: AppStateStatus) => {
            if (nextState === 'active') {
                NetInfo.fetch().then(handleNetInfoChange);
            }
        };

        const appStateSub = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            unsubscribe();
            clearTimeout(initialTimeout);
            if (slowCheckInterval.current) {
                clearInterval(slowCheckInterval.current);
            }
            appStateSub.remove();
        };
    }, []);

    return { status, recheckNow: runSlowCheck };
}
