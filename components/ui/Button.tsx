import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/theme';
import { moderateScale } from '@/utils/scaling';
import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface Props {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    disabled?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    color?: string;
}

const Button: React.FC<Props> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    leftIcon,
    rightIcon,
    style,
    color,
}) => {
    const { colors, spacing } = useTheme();
    const { impact } = useHaptics();

    const handlePressIn = useCallback(() => {
        impact();
    }, [impact]);

    const buttonStyles = [
        styles.base,
        { paddingVertical: size === 'sm' ? spacing.sm : size === 'lg' ? spacing.lg : spacing.md },
        { paddingHorizontal: size === 'sm' ? spacing.md : size === 'lg' ? spacing.xl : spacing.lg },
        variant === 'primary' && { backgroundColor: colors.accent, borderColor: colors.ink },
        variant === 'secondary' && { backgroundColor: colors.surfaceRaised },
        variant === 'ghost' && { backgroundColor: 'transparent' },
        variant === 'destructive' && { backgroundColor: colors.error },
        variant === 'outline' && { backgroundColor: colors.surface, borderColor: colors.border },
        disabled && { opacity: 0.5 },
        style,
    ] as ViewStyle[];

    const textStyles = [
        styles.text,
        { fontSize: size === 'sm' ? moderateScale(14) : size === 'lg' ? moderateScale(18) : moderateScale(16) },
        variant === 'primary' && { color: '#17151D' },
        variant === 'secondary' && { color: colors.textPrimary },
        variant === 'ghost' && { color: colors.textPrimary },
        variant === 'destructive' && { color: '#FFFFFF' },
        variant === 'outline' && { color: colors.textPrimary },
        color && { color },
    ] as TextStyle[];

    return (
        <View>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                disabled={disabled || isLoading}
                style={buttonStyles}
            >
                {isLoading ? (
                    <ActivityIndicator color={color || (variant === 'primary' ? '#17151D' : variant === 'ghost' || variant === 'outline' ? colors.primary : '#FFFFFF')} />
                ) : (
                    <>
                        {leftIcon}
                        <Text style={textStyles}>{title}</Text>
                        {rightIcon}
                    </>
                )}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        minHeight: moderateScale(48),
        borderRadius: moderateScale(16),
        borderWidth: 1.5,
        borderColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: moderateScale(8),
    },
    text: {
        fontFamily: typography.fonts.bodyBold,
        textAlign: 'center',
    },
});

export default Button;
