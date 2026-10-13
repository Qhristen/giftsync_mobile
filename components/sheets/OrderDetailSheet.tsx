import { useTheme } from '@/hooks/useTheme';
import { Order } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    Calendar01Icon,
    Comment01Icon,
    GiftIcon,
    Location01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

interface OrderDetailSheetProps {
    order: Order | null;
    onClose?: () => void;
    onChat?: (conversationId: string) => void;
    onReview?: (order: Order) => void;
    onDispute?: (order: Order) => void;
}

const stageFor = (status: Order['status']) => {
    if (status === 'Delivered') return 3;
    if (status === 'Shipped') return 2;
    if (status === 'Processing' || status === 'Disputed') return 1;
    return 0;
};

const OrderDetailSheet = forwardRef<BottomSheetRef, OrderDetailSheetProps>(({ order, onClose, onChat, onReview, onDispute }, ref) => {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <BottomSheetWrapper ref={ref} snapPoints={['82%']} scrollable>
            {!order ? (
                <View style={styles.loading}><Typography>Loading the receipt…</Typography></View>
            ) : (
                <View style={styles.content}>
                    <View style={styles.headingRow}>
                        <View>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>GIFT JOURNEY RECEIPT</Typography>
                            <Typography variant="h2">Order details</Typography>
                        </View>
                        <View style={[styles.statusStamp, { backgroundColor: order.status === 'Cancelled' ? colors.peach : colors.accent, borderColor: colors.ink }]}>
                            <Typography variant="caption" color="#17151D" style={styles.overline}>{order.status.toUpperCase()}</Typography>
                        </View>
                    </View>

                    <View style={[styles.productCard, { backgroundColor: colors.lilac, borderColor: colors.ink, shadowColor: colors.ink }]}>
                        {order.item.product.imageUrls?.[0] ? (
                            <Image source={{ uri: order.item.product.imageUrls[0] }} style={[styles.productImage, { borderColor: colors.ink }]} contentFit="cover" />
                        ) : (
                            <View style={[styles.productImage, styles.center, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={GiftIcon} size={28} color={colors.primary} />
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Typography variant="caption" style={styles.overline}>FOR {order.event?.contact?.name?.toUpperCase() || order.recipientName?.toUpperCase()}</Typography>
                            <Typography variant="h3" numberOfLines={2}>{order.item.product.name}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>{order.item.product.business?.name}</Typography>
                        </View>
                    </View>

                    {order.status !== 'Cancelled' && (
                        <View style={styles.routeSection}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>WHERE IT IS NOW</Typography>
                            <View style={styles.routeTrack}>
                                <View style={[styles.routeLine, { backgroundColor: colors.surfaceRaised }]} />
                                <View style={[styles.routeProgress, { backgroundColor: colors.primary, width: `${(stageFor(order.status) / 3) * 100}%` }]} />
                                {['Ordered', 'Preparing', 'Sent', 'Landed'].map((label, index) => (
                                    <View key={label} style={styles.routeStop}>
                                        <View style={[styles.routeDot, { backgroundColor: index <= stageFor(order.status) ? colors.accent : colors.surface, borderColor: colors.ink }]} />
                                        <Typography variant="caption" color={colors.textSecondary}>{label}</Typography>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={[styles.receipt, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <View style={styles.perforation}>
                            {Array.from({ length: 12 }).map((_, index) => <View key={index} style={[styles.perforationDot, { backgroundColor: colors.background, borderColor: colors.ink }]} />)}
                        </View>
                        <ReceiptRow label="Order number" value={`#${order.id.slice(-8).toUpperCase()}`} />
                        <ReceiptRow label="Order date" value={formatDate(order.createdAt)} icon={Calendar01Icon} />
                        <ReceiptRow label="Item subtotal" value={formatCurrency(order.subtotal, order.item.product.currency)} />
                        <ReceiptRow label="Packaging" value={formatCurrency(order.packagingFee, order.item.product.currency)} />
                        <ReceiptRow label="Delivery" value={formatCurrency(order.deliveryFee, order.item.product.currency)} />
                        {!!order.discountAmount && <ReceiptRow label="Discount" value={`−${formatCurrency(order.discountAmount, order.item.product.currency)}`} />}
                        <View style={[styles.receiptDivider, { borderColor: colors.ink }]} />
                        <View style={styles.totalRow}>
                            <Typography variant="h3">Total</Typography>
                            <Typography variant="h2" color={colors.primary}>{formatCurrency(order.total, order.item.product.currency)}</Typography>
                        </View>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={[styles.infoCard, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={Location01Icon} size={21} color={colors.ink} />
                            <Typography variant="caption" color={colors.textSecondary}>DELIVERY TO</Typography>
                            <Typography variant="bodyBold" numberOfLines={2}>{order.deliveryAddress?.recipientName || order.recipientName}</Typography>
                            <Typography variant="caption" color={colors.textSecondary} numberOfLines={3}>{[order.deliveryAddress?.line1, order.deliveryAddress?.city, order.deliveryAddress?.state].filter(Boolean).join(', ')}</Typography>
                        </View>
                        <View style={[styles.infoCard, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={GiftIcon} size={21} color={colors.ink} />
                            <Typography variant="caption" color={colors.textSecondary}>GIFT NOTE</Typography>
                            <Typography variant="caption" numberOfLines={5}>{order.giftMessage || 'No message was added to this gift.'}</Typography>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        {order.paymentStatus !== 'paid' && order.status !== 'Cancelled' ? (
                            <Button
                                title="Complete payment"
                                onPress={() => {
                                    onClose?.();
                                    router.push({ pathname: '/checkout/payment', params: { orderId: order.id } });
                                }}
                            />
                        ) : (
                            <>
                                {order.conversationId && (
                                    <Pressable
                                        onPress={() => {
                                            onClose?.();
                                            onChat?.(order.conversationId);
                                        }}
                                        style={[styles.chatButton, { backgroundColor: colors.mint, borderColor: colors.ink }]}
                                    >
                                        <HugeiconsIcon icon={Comment01Icon} size={18} color={colors.ink} />
                                        <Typography variant="label">Chat with vendor</Typography>
                                    </Pressable>
                                )}
                                <View style={styles.secondaryActions}>
                                    {order.status === 'Delivered' && <Button title="Leave a review" variant="secondary" onPress={() => onReview?.(order)} style={{ flex: 1 }} />}
                                    {order.paymentStatus === 'paid' && order.status !== 'Cancelled' && <Button title="Report an issue" variant="outline" onPress={() => onDispute?.(order)} style={{ flex: 1 }} color={colors.error} />}
                                </View>
                            </>
                        )}
                    </View>
                </View>
            )}
        </BottomSheetWrapper>
    );
});

OrderDetailSheet.displayName = 'OrderDetailSheet';

function ReceiptRow({ label, value, icon }: { label: string; value: string; icon?: any }) {
    const { colors } = useTheme();
    return (
        <View style={styles.receiptRow}>
            <View style={styles.receiptLabel}>
                {icon && <HugeiconsIcon icon={icon} size={16} color={colors.textSecondary} />}
                <Typography variant="body" color={colors.textSecondary}>{label}</Typography>
            </View>
            <Typography variant="bodyBold" style={{ textAlign: 'right' }}>{value}</Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    loading: { padding: 30, alignItems: 'center' },
    content: { paddingTop: 6, paddingBottom: 30 },
    headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 0.8 },
    statusStamp: { borderWidth: 1.5, borderRadius: 11, paddingHorizontal: 10, paddingVertical: 7, transform: [{ rotate: '3deg' }] },
    productCard: { borderWidth: 1.5, borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 13, shadowOffset: { width: 4, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
    productImage: { width: 76, height: 76, borderWidth: 1.5, borderRadius: 16 },
    center: { alignItems: 'center', justifyContent: 'center' },
    routeSection: { marginTop: 25 },
    routeTrack: { height: 54, marginTop: 14, flexDirection: 'row', justifyContent: 'space-between' },
    routeLine: { position: 'absolute', left: 8, right: 8, top: 8, height: 3 },
    routeProgress: { position: 'absolute', left: 8, top: 8, height: 3 },
    routeStop: { width: 52, alignItems: 'center', gap: 6 },
    routeDot: { width: 18, height: 18, borderRadius: 6, borderWidth: 1.5 },
    receipt: { marginTop: 20, borderWidth: 1.5, borderRadius: 18, padding: 17, paddingTop: 25 },
    perforation: { position: 'absolute', top: -6, left: 7, right: 7, flexDirection: 'row', justifyContent: 'space-between' },
    perforationDot: { width: 11, height: 11, borderRadius: 6, borderWidth: 1 },
    receiptRow: { minHeight: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    receiptLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    receiptDivider: { borderTopWidth: 1.5, borderStyle: 'dashed', marginVertical: 11 },
    totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    infoGrid: { flexDirection: 'row', gap: 11, marginTop: 18 },
    infoCard: { width: '48.3%', minHeight: 145, borderWidth: 1.5, borderRadius: 19, padding: 13, gap: 5 },
    actions: { gap: 11, marginTop: 22 },
    chatButton: { height: 48, borderWidth: 1.5, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    secondaryActions: { flexDirection: 'row', gap: 9 },
});

export default OrderDetailSheet;
