import { useTheme } from '@/hooks/useTheme';
import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
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
    }, []);

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
                    backgroundColor: colors.surfaceRaised, // fallback or active color
                },
                animatedStyle,
                style,
            ]}
        />
    );
}

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
});
