import { useTheme } from '@/hooks/useTheme';
import { Order } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { formatNGN } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Badge from '../ui/Badge';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

interface OrderDetailSheetProps {
    order: Order | null;
    onClose?: () => void;
    onChat?: (orderId: string) => void;
}

const OrderDetailSheet = forwardRef<BottomSheetRef, OrderDetailSheetProps>(({ order, onClose, onChat }, ref) => {
    const { colors, spacing } = useTheme();

    if (!order) return null;

    return (
        <BottomSheetWrapper ref={ref} snapPoints={['60%']}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Typography variant="h3">Order Details</Typography>
                    <Pressable
                        onPress={() => {
                            onClose?.();
                            onChat?.(order.id);
                        }}
                        style={[
                            styles.chatBtn,
                            {
                                backgroundColor: colors.primary + '15',
                                flexDirection: 'row',
                                gap: 6,
                                paddingHorizontal: 12,
                                height: 32,
                                borderRadius: 16,
                            }
                        ]}
                    >
                        <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
                        <Typography variant="label" color={colors.primary} style={{ fontSize: 13 }}>Chat Vendor</Typography>
                    </Pressable>
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
                        {order.items?.map(i => i.productName).join(', ') || 'Gift Order'}
                    </Typography>
                </View>
                <View style={styles.detailRow}>
                    <Typography variant="body" color={colors.textSecondary}>Recipient</Typography>
                    <Typography variant="bodyBold">{order.recipientName}</Typography>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.detailRow}>
                    <Typography variant="h3">Total</Typography>
                    <Typography variant="h3" color={colors.primary}>{formatNGN(order.total)}</Typography>
                </View>
            </View>

            <View style={styles.actions}>
                <Button
                    title="Close"
                    variant="outline"
                    onPress={() => onClose?.()}
                    style={{ flex: 1, borderColor: colors.border }}
                    color={colors.textPrimary}
                />
                <Button
                    title="Track Order"
                    variant="primary"
                    disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
                    onPress={() => { }}
                    style={{ flex: 1 }}
                />
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
