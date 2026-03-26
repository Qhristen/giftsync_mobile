import { useTheme } from '@/hooks/useTheme';
import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Badge from '../ui/Badge';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

export interface Order {
    id: string;
    productName: string;
    recipientName: string;
    status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | string;
    date: string;
    price: string;
}

interface OrderDetailSheetProps {
    order: Order | null;
    onClose?: () => void;
}

const OrderDetailSheet = forwardRef<BottomSheetRef, OrderDetailSheetProps>(({ order, onClose }, ref) => {
    const { colors, spacing } = useTheme();

    if (!order) return null;

    return (
        <BottomSheetWrapper ref={ref} snapPoints={['60%']}>
            <View style={styles.header}>
                <Typography variant="h3">Order Details</Typography>
                <Badge
                    label={order.status}
                    variant={order.status === 'Delivered' ? 'success' : 'amber'}
                />
            </View>

            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.detailRow}>
                    <Typography variant="body" color={colors.textSecondary}>Order ID</Typography>
                    <Typography variant="bodyBold">#{order.id}</Typography>
                </View>
                <View style={styles.detailRow}>
                    <Typography variant="body" color={colors.textSecondary}>Date</Typography>
                    <Typography variant="bodyBold">{order.date}</Typography>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.detailRow}>
                    <Typography variant="body" color={colors.textSecondary}>Product</Typography>
                    <Typography variant="bodyBold">{order.productName}</Typography>
                </View>
                <View style={styles.detailRow}>
                    <Typography variant="body" color={colors.textSecondary}>Recipient</Typography>
                    <Typography variant="bodyBold">{order.recipientName}</Typography>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.detailRow}>
                    <Typography variant="h3">Total</Typography>
                    <Typography variant="h3" color={colors.primary}>{order.price}</Typography>
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
                    disabled={order.status === 'Delivered'}
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
