import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

export default function TransactionListSkeleton() {
    const { colors, spacing } = useTheme();

    return (
        <View style={{ paddingHorizontal: spacing.xl }}>
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
                <View key={index} style={[styles.txCard, { backgroundColor: colors.surface }]}>
                    <Skeleton width={44} height={44} borderRadius={14} />
                    <View style={{ flex: 1, gap: 8 }}>
                        <Skeleton width="60%" height={16} borderRadius={4} />
                        <Skeleton width="40%" height={12} borderRadius={4} />
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 8 }}>
                        <Skeleton width={80} height={16} borderRadius={4} />
                        <Skeleton width={60} height={12} borderRadius={4} />
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    txCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
        marginBottom: 10,
        borderRadius: 16,
        // borderWidth: 1,
    },
});
