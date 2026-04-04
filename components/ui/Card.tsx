import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: 'elevated' | 'raised' | 'outline' | 'ghost';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    style?: StyleProp<ViewStyle>;
}

const Card: React.FC<Props> = ({
    children,
    onPress,
    variant = 'elevated',
    padding = 'md',
    style,
}) => {
    const { colors, spacing, isDark } = useTheme();

    const cardStyles = [
        styles.base,
        {
            backgroundColor: variant === 'raised' ? colors.surfaceRaised : colors.surface,
            borderColor: colors.border,
            borderWidth: 0,
            padding: spacing[padding],
        },
        variant === 'elevated' && !isDark && styles.shadow,
        isDark && variant === 'elevated' && { borderColor: colors.border + '4D' }, // Subtle glow border in dark mode
        style,
    ] as ViewStyle[];

    if (onPress) {
        return (
            <Pressable onPress={onPress} style={({ pressed }) => [cardStyles, pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}>
                {children}
            </Pressable>
        );
    }

    return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
    base: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    shadow: {
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.05,
        // shadowRadius: 12,
        // elevation: 4,
    },
});

export default Card;
