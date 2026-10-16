import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';

export default function PackageListSkeleton() {
    const { colors } = useTheme();
    const palette = [colors.lemon, colors.mint, colors.lavender, colors.peach];

    return (
        <View style={styles.list}>
            {palette.map((color, index) => (
                <SkeletonPaper key={color} color={colors.surface} style={[styles.card, { }]}>
                    <View style={[styles.packageIcon, { backgroundColor: color, borderColor: colors.ink }]}>
                        <Skeleton width={28} height={28} borderRadius={8} />
                    </View>
                    <View style={styles.copy}>
                        <Skeleton width="64%" height={16} />
                        <Skeleton width="42%" height={11} />
                    </View>
                    <View style={styles.trailing}>
                        <Skeleton width={62} height={16} />
                        <Skeleton width={42} height={10} />
                    </View>
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: { gap: 14, paddingHorizontal: 20 },
    card: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
    packageIcon: { width: 50, height: 50, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    copy: { flex: 1, gap: 8 },
    trailing: { alignItems: 'flex-end', gap: 8 },
});
