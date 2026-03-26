import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/theme';
import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface Props {
    label: string;
    variant?: 'primary' | 'secondary' | 'success' | 'amber' | 'error' | 'muted';
    size?: 'xs' | 'sm' | 'md';
    outline?: boolean;
    style?: StyleProp<ViewStyle>;
}

const Badge: React.FC<Props> = ({
    label,
    variant = 'primary',
    size = 'sm',
    outline = false,
    style,
}) => {
    const { colors, spacing } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary': return { bg: colors.primarySoft, text: colors.primary };
            case 'secondary': return { bg: colors.secondary + '20', text: colors.secondary };
            case 'success': return { bg: colors.success + '20', text: colors.success };
            case 'amber': return { bg: colors.accent + '20', text: colors.accent };
            case 'error': return { bg: colors.error + '20', text: colors.error };
            case 'muted': default: return { bg: colors.surfaceRaised, text: colors.textSecondary };
        }
    };

    const { bg, text } = getVariantStyles();

    const containerStyles = [
        styles.container,
        {
            backgroundColor: outline ? 'transparent' : bg,
            borderColor: outline ? text : 'transparent',
            borderWidth: outline ? 1 : 0,
            paddingHorizontal: size === 'xs' ? 6 : size === 'sm' ? 8 : 12,
            paddingVertical: size === 'xs' ? 2 : size === 'sm' ? 4 : 6,
        },
    ] as ViewStyle[];

    const textStyles = [
        styles.text,
        {
            color: text,
            fontSize: size === 'xs' ? 10 : size === 'sm' ? 12 : 14,
        },
    ] as TextStyle[];

    return (
        <View style={[containerStyles, style]}>
            <Text style={textStyles}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 100,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontFamily: typography.fonts.bodyBold,
        textTransform: 'uppercase',
    },
});

export default Badge;
