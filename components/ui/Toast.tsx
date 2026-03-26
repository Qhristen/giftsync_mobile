import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/theme';
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    visible: boolean;
    onHide: () => void;
    duration?: number;
}

const Toast: React.FC<Props> = ({ message, type = 'info', visible, onHide, duration = 3000 }) => {
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const translateY = useSharedValue(-100);

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(insets.top + spacing.md);
            const timer = setTimeout(() => {
                hideToast();
            }, duration);
            return () => clearTimeout(timer);
        } else {
            hideToast();
        }
    }, [visible, insets.top, spacing.md, duration]);

    const hideToast = () => {
        translateY.value = withTiming(-100, { duration: 300 }, (finished) => {
            if (finished) runOnJS(onHide)();
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const getVariantStyles = () => {
        switch (type) {
            case 'success': return { bg: colors.success, text: '#FFFFFF' };
            case 'error': return { bg: colors.error, text: '#FFFFFF' };
            case 'warning': return { bg: colors.accent, text: '#FFFFFF' };
            case 'info': default: return { bg: colors.secondary, text: '#FFFFFF' };
        }
    };

    const { bg, text } = getVariantStyles();

    return (
        <Animated.View style={[styles.container, { backgroundColor: bg }, animatedStyle]}>
            <Text style={[styles.text, { color: text }]}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 9999,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    text: {
        fontFamily: typography.fonts.bodyMedium,
        fontSize: 14,
        flex: 1,
    },
});

export default Toast;
