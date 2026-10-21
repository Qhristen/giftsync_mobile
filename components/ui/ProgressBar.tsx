import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { moderateScale } from '@/utils/scaling';

interface Props {
    progress: number; // 0 to 1
    height?: number;
    color?: string;
    backgroundColor?: string;
    style?: StyleProp<ViewStyle>;
}

const ProgressBar: React.FC<Props> = ({
    progress,
    height = moderateScale(8),
    color,
    backgroundColor,
    style,
}) => {
    const { colors } = useTheme();
    const progressWidth = Math.min(100, Math.max(0, progress * 100));

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
            width: `${progressWidth}%`,
        },
    ] as any;

    return (
        <View style={containerStyles}>
            <View style={fillStyles} />
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
        left: moderateScale(0),
        top: moderateScale(0),
    },
});

export default ProgressBar;
