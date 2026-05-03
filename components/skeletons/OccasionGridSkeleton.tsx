import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

export default function OccasionGridSkeleton() {
    const { colors, spacing } = useTheme();

    return (
        <View style={{ flex: 1 }}>
            {[1, 2].map((section, sIdx) => (
                <View key={sIdx} style={{ marginBottom: 24 }}>
                    <View style={{ paddingHorizontal: spacing.xl, marginBottom: 12 }}>
                        <Skeleton width={150} height={16} borderRadius={4} />
                    </View>
                    <View style={styles.gridRow}>
                        {[1, 2, 3].map((_, i) => (
                            <View key={i} style={[styles.gridCard, { backgroundColor: colors.surface }]}>
                                <Skeleton width={48} height={48} borderRadius={24} />
                                <View style={{ width: '100%', alignItems: 'center', gap: 4 }}>
                                    <Skeleton width="80%" height={14} borderRadius={4} />
                                    <Skeleton width="60%" height={10} borderRadius={4} />
                                    <Skeleton width="50%" height={10} borderRadius={4} style={{ marginTop: 4 }} />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    gridRow: {
        flexDirection: 'row',
        paddingHorizontal: 24, // spacing.xl
        gap: 12,
    },
    gridCard: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        gap: 8,
    },
});
