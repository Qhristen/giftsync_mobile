import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

export default function TransactionListSkeleton() {
    const { colors } = useTheme();
    const palette = [colors.mint, colors.lemon, colors.peach, colors.lavender, colors.sky];

    return (
        <View style={styles.list}>
            {palette.map((color) => (
                <SkeletonPaper key={color} color={colors.surface} style={styles.card}>
                    <View style={[styles.icon, { backgroundColor: color, borderColor: colors.ink }]}><Skeleton width={moderateScale(23)} height={moderateScale(23)} borderRadius={7} /></View>
                    <View style={styles.copy}><Skeleton width="61%" height={moderateScale(16)} /><Skeleton width="39%" height={moderateScale(11)} /></View>
                    <View style={styles.amount}><Skeleton width={moderateScale(76)} height={moderateScale(16)} /><Skeleton width={moderateScale(52)} height={moderateScale(10)} /></View>
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: { paddingHorizontal: moderateScale(20), gap: moderateScale(12) },
    card: { flexDirection: 'row', alignItems: 'center', padding: moderateScale(13), gap: moderateScale(12) },
    icon: { width: moderateScale(46), height: moderateScale(46), borderRadius: moderateScale(14), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    copy: { flex: 1, gap: moderateScale(7) },
    amount: { alignItems: 'flex-end', gap: moderateScale(7) },
});
