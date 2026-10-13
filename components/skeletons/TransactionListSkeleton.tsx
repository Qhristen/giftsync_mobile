import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';

export default function TransactionListSkeleton() {
    const { colors } = useTheme();
    const palette = [colors.mint, colors.lemon, colors.peach, colors.lavender, colors.sky];

    return (
        <View style={styles.list}>
            {palette.map((color) => (
                <SkeletonPaper key={color} color={colors.surface} style={styles.card}>
                    <View style={[styles.icon, { backgroundColor: color, borderColor: colors.ink }]}><Skeleton width={23} height={23} borderRadius={7} /></View>
                    <View style={styles.copy}><Skeleton width="61%" height={16} /><Skeleton width="39%" height={11} /></View>
                    <View style={styles.amount}><Skeleton width={76} height={16} /><Skeleton width={52} height={10} /></View>
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: { paddingHorizontal: 20, gap: 12 },
    card: { flexDirection: 'row', alignItems: 'center', padding: 13, gap: 12 },
    icon: { width: 46, height: 46, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    copy: { flex: 1, gap: 7 },
    amount: { alignItems: 'flex-end', gap: 7 },
});
