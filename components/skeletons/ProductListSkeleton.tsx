import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

export default function ProductListSkeleton() {
    const { colors, spacing } = useTheme();

    return (
        <View style={{ gap: spacing.md, paddingHorizontal: spacing.xl }}>
            {[1, 2, 3, 4].map((_, index) => (
                <View key={index} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.content}>
                        <Skeleton width={80} height={80} borderRadius={8} />
                        <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Skeleton width="60%" height={18} borderRadius={4} />
                                <Skeleton width={60} height={20} borderRadius={10} />
                            </View>
                            <Skeleton width="90%" height={12} borderRadius={4} />
                            <Skeleton width="40%" height={16} borderRadius={4} />
                        </View>
                    </View>
                    <View style={styles.actionRow}>
                        <Skeleton width="48%" height={36} borderRadius={8} />
                        <Skeleton width="48%" height={36} borderRadius={8} />
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 12,
        borderRadius: 20,
        // borderWidth: 1,
    },
    content: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
