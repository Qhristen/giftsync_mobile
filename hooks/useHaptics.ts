import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

export function useHaptics() {
    const selection = useCallback(() => {
        Haptics.selectionAsync();
    }, []);

    const impact = useCallback((style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
        Haptics.impactAsync(style);
    }, []);

    const notification = useCallback((type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
        Haptics.notificationAsync(type);
    }, []);

    return { selection, impact, notification };
}
