import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton from './Skeleton';

const { width } = Dimensions.get('window');

export default function ShopScreenSkeleton() {
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();

    const isLeft = (index: number) => index % 2 === 0;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header Title */}
            <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingTop: insets.top + spacing.md }]}>
                <Skeleton width={120} height={32} borderRadius={8} />
                <Skeleton width={200} height={16} borderRadius={4} style={{ marginTop: 8 }} />
            </View>

            {/* Sticky-like Search Bar */}
            <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl, marginBottom: spacing.lg }}>
                <View style={styles.searchRow}>
                    <Skeleton width={width - spacing.xl * 2 - 64} height={52} borderRadius={16} />
                    <Skeleton width={52} height={52} borderRadius={16} />
                </View>
            </View>

            {/* Hero Banner Carousel */}
            <View style={{ marginBottom: spacing.xl, paddingHorizontal: spacing.xl }}>
                <Skeleton width={width - spacing.xl * 2} height={180} borderRadius={24} />
            </View>

            {/* Dynamic Category Pills */}
            <View style={{ flexDirection: 'row', paddingHorizontal: spacing.xl, marginBottom: spacing.md, gap: 10 }}>
                {[1, 2, 3, 4].map((_, idx) => (
                    <Skeleton key={idx} width={80} height={36} borderRadius={18} />
                ))}
            </View>

            {/* Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl - 8, marginTop: 10 }}>
                {[1, 2, 3, 4].map((_, index) => (
                    <View key={index} style={[
                        styles.productWrapper,
                        isLeft(index) ? { paddingLeft: 8, paddingRight: 8 } : { paddingRight: 8, paddingLeft: 8 }
                    ]}>
                        <View style={[styles.newProductCard, { borderColor: colors.border }]}>
                            <Skeleton width="100%" height={150} borderRadius={0} />
                            <View style={styles.cardContent}>
                                <Skeleton width="80%" height={16} borderRadius={4} style={{ marginBottom: 4 }} />
                                <Skeleton width="50%" height={12} borderRadius={4} style={{ marginBottom: 10 }} />
                                <View style={styles.priceRow}>
                                    <Skeleton width={60} height={16} borderRadius={4} />
                                    <Skeleton width={32} height={32} borderRadius={16} />
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: 0
    },
    searchRow: {
        flexDirection: 'row',
        gap: 12,
    },
    productWrapper: {
        width: '50%',
        marginBottom: 16,
    },
    newProductCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    cardContent: {
        padding: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
