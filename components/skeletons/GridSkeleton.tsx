import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

export default function GridSkeleton() {
    const { colors } = useTheme();
    const palette = [colors.lemon, colors.lilac, colors.mint, colors.peach, colors.sky, colors.lemon];

    return (
        <View style={styles.grid}>
            {palette.map((color, index) => (
                <SkeletonPaper key={`${color}-${index}`} color={color} style={[styles.card, { transform: [{ rotate: index % 2 ? '1deg' : '-1deg' }] }]}>
                    <Skeleton width={moderateScale(56)} height={moderateScale(56)} borderRadius={18} />
                    <Skeleton width="78%" height={moderateScale(16)} />
                    <Skeleton width="48%" height={moderateScale(11)} />
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(14), padding: moderateScale(20) },
    card: { width: '47%', minHeight: moderateScale(150), alignItems: 'center', justifyContent: 'center', padding: moderateScale(16), gap: moderateScale(11) },
});
