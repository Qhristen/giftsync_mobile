import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

export default function GridSkeleton() {
    const { colors, spacing } = useTheme();

    return (
        <View style={{ flex: 1, padding: spacing.xl }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
                    <View key={index} style={[styles.card, { backgroundColor: colors.surfaceRaised }]}>
                        <Skeleton width={60} height={60} borderRadius={20} />
                        <Skeleton width="80%" height={16} borderRadius={4} />
                        <Skeleton width="40%" height={12} borderRadius={4} />
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '48%', // Roughly 2 columns
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        gap: 12,
    },
});
