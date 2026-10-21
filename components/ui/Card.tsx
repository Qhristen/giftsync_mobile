import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { moderateScale } from '@/utils/scaling';

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
    const { colors, spacing } = useTheme();

    const cardStyles = [
        styles.base,
        {
            backgroundColor: variant === 'raised' ? colors.surfaceRaised : colors.surface,
            borderColor: colors.border,
            borderWidth: variant === 'ghost' ? 0 : 1.5,
            padding: spacing[padding],
        },
        variant === 'elevated' && styles.shadow,
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
        borderRadius: moderateScale(22),
        overflow: 'hidden',
    },
    shadow: {
    },
});

export default Card;
