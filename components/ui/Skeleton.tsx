import { useTheme } from '@/hooks/useTheme';
import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface Props {
    width?: number | string;
    height?: number | string;
    variant?: 'rectangular' | 'circle' | 'text';
    style?: StyleProp<ViewStyle>;
}

const SkeletonChildren: React.FC<Props> = ({
    width = '100%',
    height = moderateScale(20),
    variant = 'rectangular',
    style,
}) => {
    const { colors } = useTheme();

    const containerStyles = [
        styles.base,
        {
            width: width,
            height: height,
            backgroundColor: colors.surfaceRaised,
            borderRadius: variant === 'circle' ? moderateScale(1000) : variant === 'text' ? moderateScale(4) : moderateScale(8),
            opacity: 0.55,
        },
        style,
    ] as ViewStyle[];

    return <View style={containerStyles} />;
};

const styles = StyleSheet.create({
    base: {
        overflow: 'hidden',
    },
});

export default SkeletonChildren;
