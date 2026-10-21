import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

export default function PackageListSkeleton() {
    const { colors } = useTheme();
    const palette = [colors.lemon, colors.mint, colors.lavender, colors.peach];

    return (
        <View style={styles.list}>
            {palette.map((color, index) => (
                <SkeletonPaper key={color} color={colors.surface} style={[styles.card, { }]}>
                    <View style={[styles.packageIcon, { backgroundColor: color, borderColor: colors.ink }]}>
                        <Skeleton width={moderateScale(28)} height={moderateScale(28)} borderRadius={8} />
                    </View>
                    <View style={styles.copy}>
                        <Skeleton width="64%" height={moderateScale(16)} />
                        <Skeleton width="42%" height={moderateScale(11)} />
                    </View>
                    <View style={styles.trailing}>
                        <Skeleton width={moderateScale(62)} height={moderateScale(16)} />
                        <Skeleton width={moderateScale(42)} height={moderateScale(10)} />
                    </View>
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: { gap: moderateScale(14), paddingHorizontal: moderateScale(20) },
    card: { flexDirection: 'row', alignItems: 'center', padding: moderateScale(14), gap: moderateScale(12) },
    packageIcon: { width: moderateScale(50), height: moderateScale(50), borderRadius: moderateScale(15), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    copy: { flex: 1, gap: moderateScale(8) },
    trailing: { alignItems: 'flex-end', gap: moderateScale(8) },
});
