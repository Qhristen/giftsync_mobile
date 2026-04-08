import { useTheme } from '@/hooks/useTheme';
import { Order } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Badge from '../ui/Badge';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

interface OrderDetailSheetProps {
    order: Order | null;
    onClose?: () => void;
    onChat?: (conversationId: string) => void;
}

const OrderDetailSheet = forwardRef<BottomSheetRef, OrderDetailSheetProps>(({ order, onClose, onChat }, ref) => {
    const { colors, spacing } = useTheme();
    const router = useRouter();

    if (!order) return null;

    return (
        <BottomSheetWrapper ref={ref} snapPoints={['60%']}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Typography variant="h3">Order Details</Typography>

                </View>
                <Badge
                    label={order.status}
                    variant={order.status === 'Delivered' ? 'success' : order.status === 'Cancelled' ? 'error' : 'amber'}
                />
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.detailRow}>
                    <Typography variant="body" color={colors.textSecondary}>Order ID</Typography>
                    <Typography variant="bodyBold">#{order.id.slice(-8).toUpperCase()}</Typography>
                </View>
                <View style={styles.detailRow}>
                    <Typography variant="body" color={colors.textSecondary}>Date</Typography>
                    <Typography variant="bodyBold">{formatDate(order.createdAt)}</Typography>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.detailRow}>
                    <Typography variant="body" color={colors.textSecondary}>Product</Typography>
                    <Typography variant="bodyBold" style={{ flex: 1, textAlign: 'right' }}>
                        {order.item.product.name}
                    </Typography>
                </View>
                <View style={styles.detailRow}>
                    <Typography variant="body" color={colors.textSecondary}>Recipient</Typography>
                    <Typography variant="bodyBold">{order.recipientName}</Typography>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.detailRow}>
                    <Typography variant="h3">Total</Typography>
                    <Typography variant="h3" color={colors.primary}>{formatCurrency(order.total, order.item.product.currency)}</Typography>
                </View>
            </View>

            <View>
                {order.paymentStatus !== 'paid' && order.status !== 'Cancelled' ? (
                    <Button
                        title="Pay Now"
                        variant="primary"
                        onPress={() => {
                            onClose?.();
                            router.push({ pathname: '/checkout/payment', params: { orderId: order.id } });
                        }}
                        style={[{ flex: 1 }]}
                    />
                )
                    :order.conversationId &&
                    <Pressable
                        onPress={() => {
                            onClose?.();
                            onChat?.(order.conversationId);
                        }}
                        style={[
                            styles.chatBtn,
                            {
                                backgroundColor: colors.primary + '15',
                                flexDirection: 'row',
                                gap: 6,
                                paddingHorizontal: 12,
                                height: 48,
                                borderRadius: 16,
                                flex: 1,
                            }
                        ]}
                    >
                        <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
                        <Typography variant="label" color={colors.primary} style={{ fontSize: 13 }}>Chat Vendor</Typography>
                    </Pressable>
                }
            </View>
        </BottomSheetWrapper>
    );
});

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    chatBtn: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        gap: 12,
        marginBottom: 24,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.2,
        marginVertical: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 'auto',
    },
});

export default OrderDetailSheet;
