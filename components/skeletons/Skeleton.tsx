import { useTheme } from '@/hooks/useTheme';
import React, { ReactNode, useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: StyleProp<ViewStyle>;
}

interface SkeletonPaperProps {
    children: ReactNode;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

export default function Skeleton({
    width,
    height,
    borderRadius = 8,
    style,
}: SkeletonProps) {
    const { colors } = useTheme();
    const opacity = useSharedValue(0.5);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1000 }),
                withTiming(0.5, { duration: 1000 })
            ),
            -1,
            true
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width: width as any,
                    height: height as any,
                    borderRadius,
                    backgroundColor: colors.textMuted + '45',
                },
                animatedStyle,
                style,
            ]}
        />
    );
}

export function SkeletonPaper({ children, color, style }: SkeletonPaperProps) {
    const { colors } = useTheme();

    return (
        <View
            style={[
                styles.paper,
                {
                    backgroundColor: color || colors.surface,
                    borderColor: colors.ink,
                    shadowColor: colors.ink,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
    paper: {
        borderWidth: 1.5,
        borderRadius: 22,
        shadowOffset: { width: 3, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 0,
        elevation: 2,
    },
});
