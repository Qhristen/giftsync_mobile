import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

export default function PackageListSkeleton() {
    const { colors, spacing } = useTheme();

    return (
        <View style={{ gap: spacing.md }}>
            {[1, 2, 3, 4].map((_, index) => (
                <View key={index} style={[styles.packageCard, { backgroundColor: colors.surface }]}>
                    <Skeleton width={48} height={48} borderRadius={24} />
                    <View style={{ flex: 1, marginLeft: 16, gap: 8 }}>
                        <Skeleton width="60%" height={16} borderRadius={4} />
                        <Skeleton width="40%" height={12} borderRadius={4} />
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 8 }}>
                        <Skeleton width={60} height={16} borderRadius={4} />
                        <Skeleton width={40} height={12} borderRadius={4} />
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    packageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        // borderWidth: 1,
    },
});
