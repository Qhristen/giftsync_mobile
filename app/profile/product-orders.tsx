import ConfirmDeliverySheet from '@/components/sheets/ConfirmDeliverySheet';
import OrderListSkeleton from '@/components/skeletons/OrderListSkeleton';
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
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01Icon,
    Calendar01Icon,
    Location01Icon,
    LegalDocument01Icon,
    UserIcon
} from '@hugeicons/core-free-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from '@/utils/scaling';

export default function ProductOrdersScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();

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

    const getStatusVariant = (status: OrderStatus) => {
        switch (status) {
            case 'Processing': return 'amber';
            case 'Shipped': return 'primary';
            case 'Delivered': return 'success';
            case 'Cancelled': return 'error';
            default: return 'muted';
        }
    };

    const paper = [colors.lilac, colors.mint, colors.peach, colors.lemon];

    const renderOrderItem = ({ item, index }: { item: Order; index: number }) => (
        <Card style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.ink, transform: [{ rotate: index % 2 ? '0.5deg' : '-0.5deg' }] }]}>
            <View style={[styles.statusTab, { backgroundColor: paper[index % paper.length], borderColor: colors.ink }]}>
                <Typography variant="caption" style={styles.overline}>DISPATCH {String(index + 1).padStart(2, '0')}</Typography>
            </View>
            <View style={styles.orderHeader}>
                <Typography variant="h4">Order #{item.id?.slice(-6).toUpperCase()}</Typography>
                <Badge variant={getStatusVariant(item.status)} label={item.status} />
            </View>

            <View style={[styles.divider, { borderColor: colors.textMuted }]} />

            <View style={styles.orderDetail}>
                <View style={styles.detailRow}>
                    <HugeiconsIcon icon={UserIcon} size={moderateScale(16)} color={colors.textSecondary} />
                    <Typography variant="body" color={colors.textSecondary}>{item?.event?.contact?.name ?? ""}</Typography>
                </View>
                <View style={styles.detailRow}>
                    <HugeiconsIcon icon={Calendar01Icon} size={moderateScale(16)} color={colors.textSecondary} />
                    <Typography variant="body" color={colors.textSecondary}>{formatDate(item.deliveryDate)}</Typography>
                </View>
                <View style={styles.detailRow}>
                    <HugeiconsIcon icon={Location01Icon} size={moderateScale(16)} color={colors.textSecondary} />
                    <Typography variant="body" color={colors.textSecondary} numberOfLines={1}>{item?.deliveryAddress?.line1 ?? ""}</Typography>
                </View>
            </View>

            <View style={[styles.footer, { borderTopColor: colors.textMuted }]}>
                <Typography variant="label">Total:</Typography>
                <Typography variant="h4" color={colors.primary}>{formatCurrency(item.total, 'NGN')}</Typography>
            </View>

            {item.status !== 'Delivered' && item.status !== 'Cancelled' && item.status !== 'Disputed' && (
                <View style={{ marginTop: moderateScale(12) }}>
                    <Button
                        disabled={item.status.toLowerCase() === 'disputed'}
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
            <View style={[styles.header, { paddingTop: insets.top + moderateScale(10) }]}>
                <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={moderateScale(22)} color={colors.ink} />
                </Pressable>
                <View style={{ flex: 1, marginLeft: moderateScale(12) }}>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>MAKER DISPATCH DESK</Typography>
                    <Typography variant="h2" numberOfLines={1}>Orders in motion</Typography>
                    <Typography variant="caption" color={colors.textSecondary} numberOfLines={1}>{productName}</Typography>
                </View>
            </View>

            {isLoading ? (
                <View style={{ flex: 1, paddingTop: moderateScale(20) }}>
                    <OrderListSkeleton />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: spacing.xl, paddingBottom: moderateScale(100) }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={[styles.emptyContainer, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={LegalDocument01Icon} size={moderateScale(48)} color={colors.ink} />
                            <Typography variant="h3">No dispatch slips yet.</Typography>
                            <Typography variant="body" color={colors.textSecondary}>Orders for this gift will land here.</Typography>
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
        paddingBottom: moderateScale(16),
        paddingHorizontal: moderateScale(20),
    },
    backButton: {
        width: moderateScale(44),
        height: moderateScale(44),
        borderRadius: moderateScale(14),
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-3deg' }],
    },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(0.9) },
    orderCard: {
        marginBottom: moderateScale(16),
        padding: moderateScale(16),
        borderWidth: 1.5,
        borderRadius: moderateScale(22),
    },
    statusTab: { position: 'absolute', right: moderateScale(14), top: moderateScale(-9), borderWidth: 1.25, borderRadius: moderateScale(8), paddingHorizontal: moderateScale(8), paddingVertical: moderateScale(4), transform: [{ rotate: '2deg' }], zIndex: 2 },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateScale(12),
    },
    divider: {
        borderTopWidth: 1,
        borderStyle: 'dashed',
        marginBottom: moderateScale(12),
    },
    orderDetail: {
        gap: moderateScale(8),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(8),
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: moderateScale(16),
        paddingTop: moderateScale(12),
        borderTopWidth: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: moderateScale(60),
        padding: moderateScale(24),
        borderWidth: 1.5,
        borderRadius: moderateScale(22),
        gap: moderateScale(6),
    }
});
