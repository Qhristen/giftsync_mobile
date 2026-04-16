import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

const { width } = Dimensions.get('window');

export default function ShopItemDetailSkeleton() {
    const { colors, spacing } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { top: spacing.xl, paddingHorizontal: spacing.xl }]}>
                <Skeleton width={40} height={40} borderRadius={20} />
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* Image Gallery */}
                <Skeleton width={width} height={width * 1.1} borderRadius={0} />

                {/* Details */}
                <View style={[styles.details, { padding: spacing.xl, backgroundColor: colors.surface }]}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1, gap: 8 }}>
                            <Skeleton width="80%" height={28} borderRadius={4} />
                            <Skeleton width={80} height={24} borderRadius={4} />
                        </View>
                        <Skeleton width={60} height={32} borderRadius={16} />
                    </View>

                    {/* Vendor Card */}
                    <View style={[styles.vendorCard, { borderColor: colors.border, marginTop: spacing.lg, borderRadius: 12, borderWidth: 1 }]}>
                        <Skeleton width={40} height={40} borderRadius={20} />
                        <View style={{ flex: 1, marginLeft: 12, gap: 4 }}>
                            <Skeleton width={120} height={16} borderRadius={4} />
                            <Skeleton width={60} height={12} borderRadius={4} />
                        </View>
                        <Skeleton width={20} height={20} borderRadius={10} />
                    </View>

                    {/* Delivery Status */}
                    <View style={{ marginTop: spacing.xl, gap: 12 }}>
                        <Skeleton width={120} height={20} borderRadius={4} />
                        <View style={[styles.deliveryCard, { backgroundColor: colors.surfaceRaised }]}>
                            <Skeleton width={36} height={36} borderRadius={18} />
                            <View style={{ flex: 1, gap: 8 }}>
                                <Skeleton width="50%" height={16} borderRadius={4} />
                                <Skeleton width="80%" height={12} borderRadius={4} />
                                <Skeleton width="100%" height={24} borderRadius={4} />
                            </View>
                        </View>
                    </View>

                    {/* Category */}
                    <View style={{ marginTop: spacing.xl, gap: 8 }}>
                        <Skeleton width={100} height={20} borderRadius={4} />
                        <Skeleton width={80} height={16} borderRadius={4} />
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <Skeleton width="100%" height={56} borderRadius={28} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        zIndex: 10,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
    },
    details: {
        marginTop: -32,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    vendorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    deliveryCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        gap: 12,
        borderRadius: 16,
    },
    footer: {
        padding: 24,
    },
});
