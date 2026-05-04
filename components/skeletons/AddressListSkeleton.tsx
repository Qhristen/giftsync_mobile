import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

export default function AddressListSkeleton() {
    const { colors, spacing } = useTheme();

    return (
        <View style={{ paddingHorizontal: spacing.sm }}>
            {[1, 2].map((_, index) => (
                <View key={index} style={[styles.addressCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Skeleton width={48} height={48} borderRadius={24} />
                    <View style={{ flex: 1, gap: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Skeleton width="40%" height={16} borderRadius={4} />
                            <Skeleton width={50} height={16} borderRadius={4} />
                        </View>
                        <Skeleton width="80%" height={12} borderRadius={4} />
                    </View>
                    <Skeleton width={24} height={24} borderRadius={4} />
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 16,
        gap: 16,
        borderRadius: 20,
        // borderWidth: 1,
    },
});
