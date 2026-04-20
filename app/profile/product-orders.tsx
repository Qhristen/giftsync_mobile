import ConfirmDeliverySheet from '@/components/sheets/ConfirmDeliverySheet';
import ListSkeleton from '@/components/skeletons/ListSkeleton';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useGetOrdersByProductQuery } from '@/store/api/orderApi';
import { Order, OrderStatus } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

export default function ProductOrdersScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { colors, spacing } = useTheme();

    const productId = params.productId as string;
    const productName = params.productName as string;

    const { data: productOrdersdata, isLoading } = useGetOrdersByProductQuery(productId, { skip: !productId });
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const confirmSheet = useBottomSheet();
    const orders = productOrdersdata?.items || [];

    const handleOpenConfirm = (order: Order) => {
        setSelectedOrder(order);
        confirmSheet.open();
    };

    const handleConfirmSuccess = () => {
        confirmSheet.close();
        // The RTK Query invalidation for 'Orders' in useConfirmDeliveryMutation 
        // will automatically refetch the list.
    };

    const getStatusVariant = (status: OrderStatus): "primary" | "secondary" | "success" | "amber" | "error" | "muted" => {
        switch (status) {
            case 'Processing': return 'amber';
            case 'Shipped': return 'primary';
            case 'Delivered': return 'success';
            case 'Cancelled': return 'error';
            default: return 'muted';
        }
    };

    const renderOrderItem = ({ item }: { item: Order }) => (
        <Card style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Typography variant="h4">Order #{item.id?.slice(-6).toUpperCase()}</Typography>
                <Badge variant={getStatusVariant(item.status)} label={item.status} />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border + '33' }]} />

            <View style={styles.orderDetail}>
                <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                    <Typography variant="body" color={colors.textSecondary}>{item.recipientName}</Typography>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                    <Typography variant="body" color={colors.textSecondary}>{formatDate(item.deliveryDate)}</Typography>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                    <Typography variant="body" color={colors.textSecondary} numberOfLines={1}>{item.deliveryAddress.line1}</Typography>
                </View>
            </View>

            <View style={[styles.footer, { borderTopColor: colors.border + '33' }]}>
                <Typography variant="label">Total:</Typography>
                <Typography variant="h4" color={colors.primary}>{formatCurrency(item.total, 'NGN')}</Typography>
            </View>

            {item.status !== 'Delivered' && item.status !== 'Cancelled' && (
                <View style={{ marginTop: 12 }}>
                    <Button
                        title="Mark as Delivered"
                        onPress={() => handleOpenConfirm(item)}
                        size="sm"
                    />
                </View>
            )}
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border + '33' }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Typography variant="h3" numberOfLines={1}>Product Orders</Typography>
                    <Typography variant="caption" color={colors.textSecondary} numberOfLines={1}>{productName}</Typography>
                </View>
            </View>

            {isLoading ? (
                <View style={{ flex: 1, paddingTop: 20 }}>
                    <ListSkeleton />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={64} color={colors.border} />
                            <Typography variant="body" color={colors.textSecondary} style={{ marginTop: 16 }}>No orders for this product yet.</Typography>
                        </View>
                    }
                />
            )}

            {/* Bottom Sheet */}
            <ConfirmDeliverySheet
                ref={confirmSheet.ref}
                order={selectedOrder}
                onSuccess={handleConfirmSuccess}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    orderCard: {
        marginBottom: 16,
        padding: 16,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        marginBottom: 12,
    },
    orderDetail: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    }
});
