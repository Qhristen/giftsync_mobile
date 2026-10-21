import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

export default function EventGridSkeleton() {
    const { colors } = useTheme();
    const palette = [colors.lemon, colors.lilac, colors.mint, colors.peach];

    return (
        <View style={styles.wrap}>
            <View style={styles.sectionHeading}>
                <Skeleton width={moderateScale(28)} height={moderateScale(2)} borderRadius={1} />
                <Skeleton width={moderateScale(128)} height={moderateScale(15)} />
            </View>
            {palette.map((color, index) => (
                <SkeletonPaper key={color} color={colors.surface} style={[styles.mapRow, { marginLeft: index % 2 ? moderateScale(11) : moderateScale(0), marginRight: index % 2 ? moderateScale(0) : moderateScale(11) }]}>
                    <View style={[styles.date, { backgroundColor: color, borderColor: colors.ink }]}>
                        <Skeleton width={moderateScale(30)} height={moderateScale(21)} />
                        <Skeleton width={moderateScale(24)} height={moderateScale(9)} />
                    </View>
                    <View style={styles.copy}>
                        <Skeleton width="70%" height={moderateScale(17)} />
                        <Skeleton width="48%" height={moderateScale(12)} />
                    </View>
                    <Skeleton width={moderateScale(38)} height={moderateScale(38)} borderRadius={12} />
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { paddingHorizontal: moderateScale(20), paddingTop: moderateScale(12), gap: moderateScale(14) },
    sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(10) },
    mapRow: { minHeight: moderateScale(90), flexDirection: 'row', alignItems: 'center', gap: moderateScale(12), padding: moderateScale(12) },
    date: { width: moderateScale(58), height: moderateScale(62), borderWidth: 1.25, borderRadius: moderateScale(14), alignItems: 'center', justifyContent: 'center', gap: moderateScale(4) },
    copy: { flex: 1, gap: moderateScale(8) },
});
