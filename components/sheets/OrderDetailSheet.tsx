import { useTheme } from '@/hooks/useTheme';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { useCreateConversationMutation } from '@/store/api/chatApi';
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
import { toast } from 'sonner-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';
import { moderateScale } from '@/utils/scaling';

interface OrderDetailSheetProps {
    order: Order | null;
    onClose?: () => void;
    onChat?: (conversationId: string) => void;
    onReview?: (order: Order) => void;
    onDispute?: (order: Order) => void;
}

const stageFor = (status: Order['status']) => {
    if (status === 'Delivered') return 3;
    if (status === 'Shipped' || status === 'Out_for_Delivery') return 2;
    if (status === 'Processing' || status === 'Disputed') return 1;
    return 0;
};

const OrderDetailSheet = forwardRef<BottomSheetRef, OrderDetailSheetProps>(({ order, onClose, onChat, onReview, onDispute }, ref) => {
    const { colors } = useTheme();
    const { enabled: reviewsEnabled } = useFeatureFlag('business_reviews');
    const { enabled: disputesEnabled } = useFeatureFlag('disputes');
    const router = useRouter();
    const [createConversation, { isLoading: isOpeningChat }] = useCreateConversationMutation();
    const product = order?.item?.product;
    const currency = product?.currency || 'NGN';
    const vendorUserId = order?.business?.userId || product?.business?.userId;

    const openChat = async () => {
        if (!order || isOpeningChat) return;

        try {
            let conversationId = order.conversationId;

            if (!conversationId && vendorUserId) {
                const conversation = await createConversation({
                    participantIds: [vendorUserId],
                    orderId: order.id,
                }).unwrap();
                conversationId = conversation.id;
            }

            if (!conversationId) {
                toast.error('Chat is not available yet', {
                    description: 'A sourcing team member must be assigned to this order first.',
                });
                return;
            }

            onClose?.();
            if (onChat) onChat(conversationId);
            else router.push(`/chat/${conversationId}`);
        } catch (error: unknown) {
            const message = (error as { data?: { message?: string } })?.data?.message;
            toast.error('Could not open chat', { description: message || 'Please try again.' });
        }
    };

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

                    <View style={[styles.productCard, { backgroundColor: colors.lilac, borderColor: colors.ink }]}>
                        {product?.imageUrls?.[0] ? (
                            <Image source={{ uri: product.imageUrls[0] }} style={[styles.productImage, { borderColor: colors.ink }]} contentFit="cover" />
                        ) : (
                            <View style={[styles.productImage, styles.center, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={GiftIcon} size={moderateScale(28)} color={colors.primary} />
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Typography variant="caption" style={styles.overline}>FOR {order.event?.contact?.name?.toUpperCase() || order.recipientName?.toUpperCase()}</Typography>
                            <Typography variant="h3" numberOfLines={2}>{product?.name || order.item?.productName || 'Custom gift request'}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>{product?.business?.name || 'GiftSync sourcing team'}</Typography>
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
                        <ReceiptRow label="Item subtotal" value={formatCurrency(order.subtotal, currency)} />
                        <ReceiptRow label="Packaging" value={formatCurrency(order.packagingFee, currency)} />
                        <ReceiptRow label="Delivery" value={formatCurrency(order.deliveryFee, currency)} />
                        {!!order.discountAmount && <ReceiptRow label="Discount" value={`−${formatCurrency(order.discountAmount, currency)}`} />}
                        <View style={[styles.receiptDivider, { borderColor: colors.ink }]} />
                        <View style={styles.totalRow}>
                            <Typography variant="h3">Total</Typography>
                            <Typography variant="h2" color={colors.primary}>{formatCurrency(order.total, currency)}</Typography>
                        </View>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={[styles.infoCard, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={Location01Icon} size={moderateScale(21)} color={colors.ink} />
                            <Typography variant="caption" color={colors.textSecondary}>DELIVERY TO</Typography>
                            <Typography variant="bodyBold" numberOfLines={2}>{order.deliveryAddress?.recipientName || order.recipientName}</Typography>
                            <Typography variant="caption" color={colors.textSecondary} numberOfLines={3}>{[order.deliveryAddress?.line1, order.deliveryAddress?.city, order.deliveryAddress?.state].filter(Boolean).join(', ')}</Typography>
                        </View>
                        <View style={[styles.infoCard, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={GiftIcon} size={moderateScale(21)} color={colors.ink} />
                            <Typography variant="caption" color={colors.textSecondary}>GIFT NOTE</Typography>
                            <Typography variant="caption" numberOfLines={5}>{order.giftMessage || 'No message was added to this gift.'}</Typography>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        {order.paymentStatus === 'pending' && order.status !== 'Cancelled' && order.total > 0 && (
                            <Button
                                title="Complete payment"
                                onPress={() => {
                                    onClose?.();
                                    router.push({ pathname: '/checkout/payment', params: { orderId: order.id } });
                                }}
                            />
                        )}

                        <View style={styles.secondaryActions}>
                            {reviewsEnabled && order.status === 'Delivered' && <Button title="Leave a review" variant="secondary" onPress={() => onReview?.(order)} style={{ flex: 1 }} />}
                            {disputesEnabled && order.paymentStatus === 'paid' && order.status !== 'Cancelled' && <Button title="Report an issue" variant="outline" onPress={() => onDispute?.(order)} style={{ flex: 1 }} color={colors.error} />}

                            {(order.status !== 'Cancelled' && order.paymentStatus === 'paid') && (
                                <Pressable
                                    disabled={isOpeningChat}
                                    onPress={openChat}
                                    style={[styles.chatButton, { backgroundColor: colors.mint, borderColor: colors.ink }, isOpeningChat && styles.disabled]}
                                >
                                    <HugeiconsIcon icon={Comment01Icon} size={moderateScale(18)} color={colors.ink} />
                                    <Typography variant="label">
                                        {isOpeningChat ? 'Opening chat…' : product ? 'Chat with vendor' : 'Chat with sourcing team'}
                                    </Typography>
                                </Pressable>
                            )}
                        </View>
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
                {icon && <HugeiconsIcon icon={icon} size={moderateScale(16)} color={colors.textSecondary} />}
                <Typography variant="body" color={colors.textSecondary}>{label}</Typography>
            </View>
            <Typography variant="bodyBold" style={{ textAlign: 'right' }}>{value}</Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    loading: { padding: moderateScale(30), alignItems: 'center' },
    content: { paddingTop: moderateScale(6), paddingBottom: moderateScale(30) },
    headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: moderateScale(12), marginBottom: moderateScale(20) },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(0.8) },
    statusStamp: { borderWidth: 1.5, borderRadius: moderateScale(11), paddingHorizontal: moderateScale(10), paddingVertical: moderateScale(7), transform: [{ rotate: '3deg' }] },
    productCard: { borderWidth: 1.5, borderRadius: moderateScale(22), padding: moderateScale(14), flexDirection: 'row', alignItems: 'center', gap: moderateScale(13), },
    productImage: { width: moderateScale(76), height: moderateScale(76), borderWidth: 1.5, borderRadius: moderateScale(16) },
    center: { alignItems: 'center', justifyContent: 'center' },
    routeSection: { marginTop: moderateScale(25) },
    routeTrack: { height: moderateScale(54), marginTop: moderateScale(14), flexDirection: 'row', justifyContent: 'space-between' },
    routeLine: { position: 'absolute', left: moderateScale(8), right: moderateScale(8), top: moderateScale(8), height: moderateScale(3) },
    routeProgress: { position: 'absolute', left: moderateScale(8), top: moderateScale(8), height: moderateScale(3) },
    routeStop: { width: moderateScale(52), alignItems: 'center', gap: moderateScale(6) },
    routeDot: { width: moderateScale(18), height: moderateScale(18), borderRadius: moderateScale(6), borderWidth: 1.5 },
    receipt: { marginTop: moderateScale(20), borderWidth: 1.5, borderRadius: moderateScale(18), padding: moderateScale(17), paddingTop: moderateScale(25) },
    perforation: { position: 'absolute', top: moderateScale(-6), left: moderateScale(7), right: moderateScale(7), flexDirection: 'row', justifyContent: 'space-between' },
    perforationDot: { width: moderateScale(11), height: moderateScale(11), borderRadius: moderateScale(6), borderWidth: 1 },
    receiptRow: { minHeight: moderateScale(35), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: moderateScale(12) },
    receiptLabel: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(6), flex: 1 },
    receiptDivider: { borderTopWidth: 1.5, borderStyle: 'dashed', marginVertical: moderateScale(11) },
    totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    infoGrid: { flexDirection: 'row', gap: moderateScale(11), marginTop: moderateScale(18) },
    infoCard: { width: '48.3%', borderWidth: 1.5, borderRadius: moderateScale(19), padding: moderateScale(13), gap: moderateScale(5) },
    actions: { gap: moderateScale(11), marginTop: moderateScale(22) },
    chatButton: { borderWidth: 1.5, paddingHorizontal: moderateScale(11), borderRadius: moderateScale(15), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: moderateScale(6) },
    disabled: { opacity: 0.6 },
    secondaryActions: { flexDirection: 'row', gap: moderateScale(9) },
});

export default OrderDetailSheet;
