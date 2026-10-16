import DisputeSheet from '@/components/sheets/DisputeSheet';
import OrderDetailSheet from '@/components/sheets/OrderDetailSheet';
import ReviewBusinessSheet from '@/components/sheets/ReviewBusinessSheet';
import OrderListSkeleton from '@/components/skeletons/OrderListSkeleton';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useGetOrdersQuery } from '@/store/api/orderApi';
import { Order } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    BubbleChatIcon,
    CreditCardIcon,
    GiftIcon,
    RefreshIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const statusStep = (status: Order['status']) => {
    if (status === 'Delivered') return 3;
    if (status === 'Shipped') return 2;
    if (status === 'Processing' || status === 'Disputed') return 1;
    return 0;
};

export default function OrdersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [page, setPage] = useState(1);
    const orderSheet = useBottomSheet();
    const reviewSheet = useBottomSheet();
    const disputeSheet = useBottomSheet();
    const { data, isLoading, isFetching, refetch } = useGetOrdersQuery({ page, limit: 20 });
    const allOrders = useMemo(() => data?.items || [], [data?.items]);

    const filteredOrders = useMemo(
        () => allOrders.filter((order) => activeTab === 'Active'
            ? order.status !== 'Delivered' && order.status !== 'Cancelled'
            : order.status === 'Delivered' || order.status === 'Cancelled'),
        [activeTab, allOrders],
    );

    const activeCount = allOrders.filter((order) => order.status !== 'Delivered' && order.status !== 'Cancelled').length;
    const deliveredCount = allOrders.filter((order) => order.status === 'Delivered').length;

    const loadMore = () => {
        if (data?.meta && page < data.meta.totalPages && !isFetching) setPage((value) => value + 1);
    };

    const handleChat = (conversationId: string) => router.push(`/chat/${conversationId}`);

    const openReview = (order: Order) => {
        setSelectedOrder(order);
        orderSheet.close();
        setTimeout(reviewSheet.open, 200);
    };

    const openDispute = (order: Order) => {
        setSelectedOrder(order);
        orderSheet.close();
        setTimeout(disputeSheet.open, 200);
    };

    const paperColors = [colors.lemon, colors.mint, colors.lilac, colors.peach];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 10, paddingHorizontal: spacing.xl }]}>
                <View style={styles.headerTop}>
                    <Pressable onPress={() => router.back()} style={[styles.headerButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={colors.ink} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>FROM CART TO HEART</Typography>
                        <Typography variant="h1">Gift journey</Typography>
                    </View>
                    <Pressable
                        onPress={() => { setPage(1); refetch(); }}
                        style={[styles.headerButton, { backgroundColor: colors.accent, borderColor: colors.ink }]}
                    >
                        <HugeiconsIcon icon={RefreshIcon} size={20} color="#17151D" />
                    </Pressable>
                </View>

                <View style={styles.summaryBoard}>
                    <View style={[styles.summaryMain, { backgroundColor: colors.lilac, borderColor: colors.ink }]}>
                        <View style={[styles.summaryIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={GiftIcon} size={25} color={colors.primary} />
                        </View>
                        <Typography variant="h1">{activeCount}</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>GIFTS ON THE MOVE</Typography>
                    </View>
                    <View style={[styles.summarySide, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                        <Typography variant="h2">{deliveredCount}</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>landed safely</Typography>
                    </View>
                </View>

                <View style={[styles.tabs, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                    {(['Active', 'History'] as const).map((tab) => (
                        <Pressable
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            style={[styles.tab, activeTab === tab && { backgroundColor: colors.ink }]}
                        >
                            <Typography variant="label" color={activeTab === tab ? colors.surface : colors.textSecondary}>{tab === 'Active' ? 'On the move' : 'Gift archive'}</Typography>
                        </Pressable>
                    ))}
                </View>
            </View>

            {isLoading ? (
                <OrderListSkeleton />
            ) : (
                <FlashList
                    data={filteredOrders}
                    keyExtractor={(item) => item.id}
                    onRefresh={() => { setPage(1); refetch(); }}
                    refreshing={isFetching && page === 1}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 50 }}
                    renderItem={({ item, index }) => {
                        const product = item.item?.product;
                        const step = statusStep(item.status);
                        const cancelled = item.status === 'Cancelled';
                        const accent = paperColors[index % paperColors.length];
                        return (
                            <View>
                                <Pressable
                                    onPress={() => {
                                        setSelectedOrder(item);
                                        orderSheet.open();
                                    }}
                                    style={({ pressed }) => [
                                        styles.orderCard,
                                        { marginHorizontal: spacing.xl, backgroundColor: colors.surface, borderColor: colors.ink },
                                        pressed && styles.pressed,
                                    ]}
                                >
                                    <View style={styles.orderMeta}>
                                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>ORDER #{item.id.slice(-6).toUpperCase()}</Typography>
                                        <View style={[styles.statusStamp, { backgroundColor: cancelled ? colors.peach : accent, borderColor: colors.ink }]}>
                                            <Typography variant="caption" style={styles.overline}>{item.status.toUpperCase()}</Typography>
                                        </View>
                                    </View>

                                    <View style={styles.productRow}>
                                        {product?.imageUrls?.[0] ? (
                                            <Image source={{ uri: product.imageUrls[0] }} style={[styles.productImage, { borderColor: colors.ink }]} contentFit="cover" />
                                        ) : (
                                            <View style={[styles.productImage, styles.center, { backgroundColor: accent, borderColor: colors.ink }]}>
                                                <HugeiconsIcon icon={GiftIcon} size={24} color={colors.ink} />
                                            </View>
                                        )}
                                        <View style={{ flex: 1, gap: 3 }}>
                                            <Typography variant="h4" numberOfLines={2}>{product?.name || item.item?.productName || 'Gift order'}</Typography>
                                            <Typography variant="caption" color={colors.textSecondary}>For {item.event?.contact?.name || item.recipientName || 'someone special'}</Typography>
                                            <Typography variant="caption" color={colors.textSecondary}>{formatDate(item.createdAt)}</Typography>
                                        </View>
                                        <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={colors.ink} />
                                    </View>

                                    <View style={styles.journeyWrap}>
                                        <View style={[styles.journeyLine, { backgroundColor: colors.surfaceRaised }]} />
                                        <View style={[styles.journeyProgress, { backgroundColor: cancelled ? colors.error : colors.primary, width: `${cancelled ? 0 : (step / 3) * 100}%` }]} />
                                        {['Ordered', 'Preparing', 'Sent', 'Landed'].map((label, stopIndex) => (
                                            <View key={label} style={styles.journeyStop}>
                                                <View style={[styles.stopDot, { backgroundColor: stopIndex <= step && !cancelled ? colors.accent : colors.surface, borderColor: colors.ink }]} />
                                                <Typography variant="caption" color={colors.textSecondary} style={styles.stopLabel}>{label}</Typography>
                                            </View>
                                        ))}
                                    </View>

                                    <View style={[styles.orderFooter, { borderTopColor: colors.ink }]}>
                                        <View>
                                            <Typography variant="caption" color={colors.textSecondary}>ORDER TOTAL</Typography>
                                            <Typography variant="bodyBold">{formatCurrency(item.total, product?.currency || 'NGN')}</Typography>
                                        </View>
                                        {item.paymentStatus !== 'paid' && item.status !== 'Cancelled' ? (
                                            <Pressable
                                                onPress={(event) => {
                                                    event.stopPropagation();
                                                    router.push({ pathname: '/checkout/payment', params: { orderId: item.id } });
                                                }}
                                                style={[styles.actionButton, { backgroundColor: colors.accent, borderColor: colors.ink }]}
                                            >
                                                <HugeiconsIcon icon={CreditCardIcon} size={16} color="#17151D" />
                                                <Typography variant="caption" color="#17151D" style={styles.overline}>PAY NOW</Typography>
                                            </Pressable>
                                        ) : item.conversationId ? (
                                            <Pressable
                                                onPress={(event) => {
                                                    event.stopPropagation();
                                                    handleChat(item.conversationId!);
                                                }}
                                                style={[styles.actionButton, { backgroundColor: colors.mint, borderColor: colors.ink }]}
                                            >
                                                <HugeiconsIcon icon={BubbleChatIcon} size={16} color={colors.ink} />
                                                <Typography variant="caption" style={styles.overline}>CHAT</Typography>
                                            </Pressable>
                                        ) : null}
                                    </View>
                                </Pressable>
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={[styles.emptyState, { marginHorizontal: spacing.xl, backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                            <View style={[styles.emptyIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={GiftIcon} size={30} color={colors.primary} />
                            </View>
                            <Typography variant="h3">This lane is quiet.</Typography>
                            <Typography variant="body" color={colors.textSecondary} align="center">{activeTab === 'Active' ? 'Your next gift journey will appear here.' : 'Delivered and cancelled gifts become part of the archive.'}</Typography>
                        </View>
                    }
                    ListFooterComponent={isFetching && page > 1 ? <ActivityIndicator color={colors.primary} style={{ padding: 20 }} /> : null}
                />
            )}

            <OrderDetailSheet
                ref={orderSheet.ref}
                order={selectedOrder}
                onClose={orderSheet.close}
                onChat={handleChat}
                onReview={openReview}
                onDispute={openDispute}
            />
            <ReviewBusinessSheet ref={reviewSheet.ref} order={selectedOrder} onSuccess={reviewSheet.close} />
            <DisputeSheet
                ref={disputeSheet.ref}
                orderId={selectedOrder?.id || ''}
                onSuccess={() => {
                    disputeSheet.close();
                    refetch();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingBottom: 12 },
    headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerButton: { width: 44, height: 44, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 0.8 },
    summaryBoard: { flexDirection: 'row', gap: 12, marginTop: 20 },
    summaryMain: { flex: 1.35, minHeight: 112, borderWidth: 1.5, borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, },
    summaryIcon: { width: 46, height: 46, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    summarySide: { flex: 0.65, minHeight: 112, borderWidth: 1.5, borderRadius: 22, padding: 14, justifyContent: 'center' },
    tabs: { flexDirection: 'row', gap: 4, marginTop: 18, padding: 4, borderWidth: 1.5, borderRadius: 16 },
    tab: { flex: 1, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    orderCard: { borderWidth: 1.5, borderRadius: 24, padding: 15, marginVertical: 10, },
    orderMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
    statusStamp: { borderWidth: 1.25, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, transform: [{ rotate: '2deg' }] },
    productRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    productImage: { width: 70, height: 70, borderWidth: 1.5, borderRadius: 16 },
    center: { alignItems: 'center', justifyContent: 'center' },
    journeyWrap: { height: 47, marginTop: 18, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    journeyLine: { position: 'absolute', height: 3, left: 7, right: 7, top: 7 },
    journeyProgress: { position: 'absolute', height: 3, left: 7, top: 7 },
    journeyStop: { alignItems: 'center', width: 48, gap: 5 },
    stopDot: { width: 16, height: 16, borderRadius: 6, borderWidth: 1.5 },
    stopLabel: { fontSize: 10 },
    orderFooter: { borderTopWidth: 1, marginTop: 8, paddingTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    actionButton: { minHeight: 38, borderWidth: 1.25, borderRadius: 12, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6 },
    emptyState: { marginTop: 30, borderWidth: 1.5, borderRadius: 24, padding: 28, alignItems: 'center', gap: 8 },
    emptyIcon: { width: 58, height: 58, borderWidth: 1.5, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
    pressed: { opacity: 0.85, transform: [{ translateY: 2 }] },
});
