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

interface Props {
    width?: number | string;
    height?: number | string;
    variant?: 'rectangular' | 'circle' | 'text';
    style?: StyleProp<ViewStyle>;
}

const SkeletonChildren: React.FC<Props> = ({
    width = '100%',
    height = 20,
    variant = 'rectangular',
    style,
}) => {
    const { colors, spacing } = useTheme();
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            true
        );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const containerStyles = [
        styles.base,
        {
            width: width,
            height: height,
            backgroundColor: colors.surfaceRaised,
            borderRadius: variant === 'circle' ? 1000 : variant === 'text' ? 4 : 8,
        },
        style,
    ] as ViewStyle[];

    return <Animated.View style={[containerStyles, animatedStyle]} />;
};

const styles = StyleSheet.create({
    base: {
        overflow: 'hidden',
    },
});

export default SkeletonChildren;
