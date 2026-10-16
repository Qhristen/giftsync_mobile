import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/theme';
import { moderateScale } from '@/utils/scaling';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

    useEffect(() => {
        if (!visible) return;
        const timer = setTimeout(onHide, duration);
        return () => clearTimeout(timer);
    }, [duration, onHide, visible]);

    const getVariantStyles = () => {
        switch (type) {
            case 'success': return { bg: colors.success, text: '#FFFFFF' };
            case 'error': return { bg: colors.error, text: '#FFFFFF' };
            case 'warning': return { bg: colors.accent, text: '#FFFFFF' };
            case 'info': default: return { bg: colors.secondary, text: '#FFFFFF' };
        }
    };

    const { bg, text } = getVariantStyles();
    if (!visible) return null;

    return (
        <View style={[styles.container, { backgroundColor: bg, top: insets.top + spacing.md }]}>
            <Text style={[styles.text, { color: text }]}>{message}</Text>
        </View>
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
    },
    text: {
        fontFamily: typography.fonts.bodyMedium,
        fontSize: moderateScale(14),
        flex: 1,
    },
});

export default Toast;
