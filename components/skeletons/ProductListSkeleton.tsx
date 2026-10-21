import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

export default function ProductListSkeleton() {
    const { colors } = useTheme();
    const palette = [colors.lemon, colors.lilac, colors.mint, colors.peach];

    return (
        <View style={styles.list}>
            {palette.map((color, index) => (
                <SkeletonPaper key={color} color={colors.surface} style={[styles.card, { transform: [{ rotate: index % 2 ? '0.5deg' : '-0.5deg' }] }]}>
                    <View style={styles.content}>
                        <Skeleton width={moderateScale(84)} height={moderateScale(84)} borderRadius={15} />
                        <View style={styles.copy}>
                            <View style={styles.titleRow}><Skeleton width="62%" height={moderateScale(17)} /><Skeleton width={moderateScale(54)} height={moderateScale(19)} borderRadius={9} /></View>
                            <Skeleton width="88%" height={moderateScale(11)} />
                            <Skeleton width="43%" height={moderateScale(16)} />
                        </View>
                    </View>
                    <View style={[styles.dash, { borderColor: colors.textMuted }]} />
                    <View style={styles.actions}><Skeleton width="48%" height={moderateScale(39)} borderRadius={13} /><Skeleton width="48%" height={moderateScale(39)} borderRadius={13} /></View>
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: { gap: moderateScale(16), paddingHorizontal: moderateScale(20) },
    card: { padding: moderateScale(12), gap: moderateScale(11) },
    content: { flexDirection: 'row', gap: moderateScale(12) },
    copy: { flex: 1, gap: moderateScale(9), justifyContent: 'center' },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dash: { borderTopWidth: 1, borderStyle: 'dashed' },
    actions: { flexDirection: 'row', justifyContent: 'space-between' },
});
