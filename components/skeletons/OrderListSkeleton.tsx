import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

export default function OrderListSkeleton() {
    const { colors } = useTheme();
    const tabs = [colors.lilac, colors.mint, colors.peach];

    return (
        <View style={styles.list}>
            {tabs.map((tab, index) => (
                <SkeletonPaper key={tab} color={colors.surface} style={[styles.card, { transform: [{ rotate: index % 2 ? '0.6deg' : '-0.6deg' }] }]}>
                    <View style={[styles.statusTab, { backgroundColor: tab, borderColor: colors.ink }]}><Skeleton width={moderateScale(48)} height={moderateScale(9)} /></View>
                    <View style={styles.topRow}>
                        <Skeleton width={moderateScale(72)} height={moderateScale(72)} borderRadius={16} />
                        <View style={styles.copy}>
                            <Skeleton width="78%" height={moderateScale(18)} />
                            <Skeleton width="48%" height={moderateScale(12)} />
                            <Skeleton width="38%" height={moderateScale(15)} />
                        </View>
                    </View>
                    <View style={[styles.dash, { borderColor: colors.textMuted }]} />
                    <View style={styles.footer}>
                        <View style={styles.copy}><Skeleton width={moderateScale(70)} height={moderateScale(10)} /><Skeleton width={moderateScale(92)} height={moderateScale(15)} /></View>
                        <Skeleton width={moderateScale(108)} height={moderateScale(38)} borderRadius={13} />
                    </View>
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: { paddingHorizontal: moderateScale(20), gap: moderateScale(17) },
    card: { padding: moderateScale(15), gap: moderateScale(12) },
    statusTab: { position: 'absolute', right: moderateScale(13), top: moderateScale(-8), borderWidth: 1.5, borderRadius: moderateScale(8), padding: moderateScale(6) },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
    copy: { flex: 1, gap: moderateScale(7) },
    dash: { borderTopWidth: 1, borderStyle: 'dashed' },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
