import { useTheme } from '@/hooks/useTheme';
import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { moderateScale } from '@/utils/scaling';

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

    return (
        <View
            style={[
                styles.skeleton,
                {
                    width: width as any,
                    height: height as any,
                    borderRadius: moderateScale(borderRadius),
                    backgroundColor: colors.textMuted + '45',
                    opacity: 0.65,
                },
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
        borderRadius: moderateScale(22),
    },
});
