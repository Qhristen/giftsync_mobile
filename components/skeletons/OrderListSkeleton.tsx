import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

export default function OrderListSkeleton() {
    const { colors, spacing } = useTheme();

    return (
        <View style={{ gap: spacing.md, paddingHorizontal: spacing.xl }}>
            {[1, 2, 3].map((_, index) => (
                <View key={index} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.topRow}>
                        <Skeleton width={48} height={48} borderRadius={8} />
                        <View style={{ flex: 1, gap: 8 }}>
                            <Skeleton width="70%" height={16} borderRadius={4} />
                            <Skeleton width="40%" height={12} borderRadius={4} />
                        </View>
                        <Skeleton width={60} height={20} borderRadius={10} />
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.1 }]} />
                    <View style={styles.footer}>
                        <View style={{ gap: 4 }}>
                            <Skeleton width={80} height={12} borderRadius={4} />
                            <Skeleton width={60} height={16} borderRadius={4} />
                        </View>
                        <Skeleton width={100} height={32} borderRadius={16} />
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 12,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    divider: {
        height: 1,
        width: '100%',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
