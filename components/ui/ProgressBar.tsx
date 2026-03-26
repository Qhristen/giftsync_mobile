import { useTheme } from '@/hooks/useTheme';
import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface Props {
    progress: number; // 0 to 1
    height?: number;
    color?: string;
    backgroundColor?: string;
    style?: StyleProp<ViewStyle>;
}

const ProgressBar: React.FC<Props> = ({
    progress,
    height = 8,
    color,
    backgroundColor,
    style,
}) => {
    const { colors, spacing } = useTheme();
    const width = useSharedValue(0);

    useEffect(() => {
        width.value = withSpring(progress * 100);
    }, [progress, width]);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${width.value}%`,
    }));

    const containerStyles = [
        styles.container,
        {
            height,
            backgroundColor: backgroundColor || colors.surfaceRaised,
            borderRadius: height / 2,
        },
        style,
    ] as ViewStyle[];

    const fillStyles = [
        styles.fill,
        {
            height,
            backgroundColor: color || colors.primary,
            borderRadius: height / 2,
        },
        animatedStyle,
    ] as any;

    return (
        <View style={containerStyles}>
            <Animated.View style={fillStyles} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        overflow: 'hidden',
    },
    fill: {
        position: 'absolute',
        left: 0,
        top: 0,
    },
});

export default ProgressBar;
