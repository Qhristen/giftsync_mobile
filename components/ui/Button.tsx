import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/theme';
import { moderateScale } from '@/utils/scaling';
import React, { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

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
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
        scale.value = withSpring(0.97);
        impact();
    }, [scale, impact]);

    const handlePressOut = useCallback(() => {
        scale.value = withSpring(1);
    }, [scale]);

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
        <Animated.View style={animatedStyle}>
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || isLoading}
                style={buttonStyles}
            >
                {isLoading ? (
                    <ActivityIndicator color={color || (variant === 'primary' ? '#17151D' : variant === 'ghost' || variant === 'outline' ? colors.primary : '#FFFFFF')} />
                ) : (
                    <>
                        {leftIcon}
                        <Animated.Text style={textStyles}>{title}</Animated.Text>
                        {rightIcon}
                    </>
                )}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    base: {
        minHeight: 48,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#17151D',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
    },
    text: {
        fontFamily: typography.fonts.bodyBold,
        textAlign: 'center',
    },
});

export default Button;
