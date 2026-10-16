import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';

export default function OrderListSkeleton() {
    const { colors } = useTheme();
    const tabs = [colors.lilac, colors.mint, colors.peach];

    return (
        <View style={styles.list}>
            {tabs.map((tab, index) => (
                <SkeletonPaper key={tab} color={colors.surface} style={[styles.card, { transform: [{ rotate: index % 2 ? '0.6deg' : '-0.6deg' }] }]}>
                    <View style={[styles.statusTab, { backgroundColor: tab, borderColor: colors.ink }]}><Skeleton width={48} height={9} /></View>
                    <View style={styles.topRow}>
                        <Skeleton width={72} height={72} borderRadius={16} />
                        <View style={styles.copy}>
                            <Skeleton width="78%" height={18} />
                            <Skeleton width="48%" height={12} />
                            <Skeleton width="38%" height={15} />
                        </View>
                    </View>
                    <View style={[styles.dash, { borderColor: colors.textMuted }]} />
                    <View style={styles.footer}>
                        <View style={styles.copy}><Skeleton width={70} height={10} /><Skeleton width={92} height={15} /></View>
                        <Skeleton width={108} height={38} borderRadius={13} />
                    </View>
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: { paddingHorizontal: 20, gap: 17 },
    card: { padding: 15, gap: 12 },
    statusTab: { position: 'absolute', right: 13, top: -8, borderWidth: 1.5, borderRadius: 8, padding: 6 },
    topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    copy: { flex: 1, gap: 7 },
    dash: { borderTopWidth: 1, borderStyle: 'dashed' },
    footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
