import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

export default function ListSkeleton() {
    const { colors, spacing } = useTheme();

    return (
        <View style={{ gap: spacing.md, paddingHorizontal: spacing.xl }}>
            {[1, 2, 3, 4, 5].map((_, index) => (
                <View key={index} style={[styles.card, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                    <Skeleton width={48} height={48} borderRadius={8} />
                    <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
                        <Skeleton width="60%" height={16} borderRadius={4} />
                        <Skeleton width="40%" height={12} borderRadius={4} />
                    </View>
                    <Skeleton width={30} height={16} borderRadius={4} />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        // borderWidth: 1,
    },
});
