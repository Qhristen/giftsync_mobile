import OrderDetailSheet from '@/components/sheets/OrderDetailSheet';
import ReviewBusinessSheet from '@/components/sheets/ReviewBusinessSheet';
import ListSkeleton from '@/components/skeletons/ListSkeleton';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useGetOrdersQuery } from '@/store/api/orderApi';
import { Order } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

export default function OrderListScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const orderSheet = useBottomSheet();
    const reviewSheet = useBottomSheet();

    const [page, setPage] = useState(1);
    const { data, isLoading, isFetching, refetch } = useGetOrdersQuery({ page, limit: 20 });

    // We get all accumulated items directly from RTKQ since we used merge/serializeQueryArgs
    const allOrders = data?.items || [];

    const loadMore = () => {
        if (data?.meta && page < data.meta.totalPages && !isFetching) {
            setPage(p => p + 1);
        }
    };

    const handleChat = async (conversationId: string) => {
        try {
            router.push(`/chat/${conversationId}`);
        } catch (error) {
            console.error('Failed to create/join chat:', error);
        }
    };

    const filteredOrders = useMemo(() =>
        allOrders.filter(o =>
            activeTab === 'Active'
                ? (o.status !== 'Delivered' && o.status !== 'Cancelled')
                : (o.status === 'Delivered' || o.status === 'Cancelled')
        ),
        [allOrders, activeTab]
    );

    const handleReview = (order: Order) => {
        setSelectedOrder(order);
        orderSheet.close();
        setTimeout(() => {
            reviewSheet.open();
        }, 500);
    };

    const handleReviewSuccess = () => {
        reviewSheet.close();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { padding: spacing.xl }]}>
                <View style={styles.headerTop}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </Pressable>
                    <Typography variant="h1">Orders</Typography>
                    <View style={{ flex: 1 }} />
                    <Pressable
                        onPress={() => refetch()}
                        style={({ pressed }) => [
                            styles.refreshBtn,
                            { backgroundColor: colors.surfaceRaised },
                            pressed && { opacity: 0.7 }
                        ]}
                    >
                        <Ionicons
                            name="refresh"
                            size={20}
                            color={isFetching ? colors.primary : colors.textPrimary}
                        />
                    </Pressable>
                </View>

                {/* Tab Switcher */}
                <View style={[styles.tabs, { backgroundColor: colors.surfaceRaised }]}>
                    {['Active', 'History'].map((tab) => (
                        <Pressable
                            key={tab}
                            onPress={() => setActiveTab(tab as 'Active' | 'History')}
                            style={[
                                styles.tab,
                                { backgroundColor: activeTab === tab ? colors.surface : 'transparent' },
                                activeTab === tab && styles.tabActiveShadow,
                            ]}
                        >
                            <Typography variant="label" color={activeTab === tab ? colors.primary : colors.textSecondary}>{tab}</Typography>
                        </Pressable>
                    ))}
                </View>
            </View>

            {isLoading ? (
                <View style={{ flex: 1, paddingTop: 20 }}>
                    <ListSkeleton />
                </View>
            ) : (
                <FlashList
                    data={filteredOrders}
                    keyExtractor={(item) => item.id}
                    onRefresh={() => { setPage(1); refetch(); }}
                    refreshing={isFetching && page === 1}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    renderItem={({ item }) => {
                        const productName = item.item.product?.name;
                        const productImage = item.item.product?.imageUrls?.[0];

                        return (
                            <Card
                                variant="elevated"
                                style={[styles.orderCard, { marginHorizontal: spacing.xl, marginVertical: spacing.sm }]}
                                onPress={() => {
                                    setSelectedOrder(item);
                                    orderSheet.open();
                                }}
                            >
                                <View style={styles.orderTop}>
                                    {productImage ? (
                                        <Image
                                            source={{ uri: productImage }}
                                            style={styles.orderImage}
                                            contentFit="cover"
                                            transition={200}
                                        />
                                    ) : (
                                        <View style={styles.placeholderImage} />
                                    )}
                                    <View style={{ flex: 1 }}>
                                        <Typography variant="bodyBold">{productName}</Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>To {item.occasion?.contact?.name}</Typography>
                                    </View>
                                    <Badge
                                        label={item.status}
                                        variant={item.status === 'Delivered' ? 'success' : item.status === 'Cancelled' ? 'error' : 'amber'}
                                        size="xs"
                                    />
                                </View>
                                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                <View style={styles.orderFooter}>
                                    <View>
                                        <Typography variant="caption" color={colors.textMuted}>{formatDate(item.createdAt)}</Typography>
                                        <Typography variant="label" color={colors.primary}>{formatCurrency(item.total, item.item.product.currency || 'NGN')}</Typography>
                                    </View>

                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        {item.paymentStatus !== 'paid' && item.status !== 'Cancelled' ? (
                                            <Pressable
                                                onPress={() => router.push({ pathname: '/checkout/payment', params: { orderId: item.id } })}
                                                style={[styles.cardChatBtn, { backgroundColor: colors.success + '10' }]}
                                            >
                                                <Ionicons name="card-outline" size={16} color={colors.success} />
                                                <Typography variant="label" color={colors.success} style={{ fontSize: 12 }}>Pay Now</Typography>
                                            </Pressable>
                                        ) : item.conversationId &&
                                        <Pressable
                                            onPress={() => handleChat(item.id)}
                                            style={[styles.cardChatBtn, { backgroundColor: colors.primary + '10' }]}
                                        >
                                            <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
                                            <Typography variant="label" color={colors.primary} style={{ fontSize: 12 }}>Chat Vendor</Typography>
                                        </Pressable>
                                        }
                                    </View>
                                </View>
                            </Card>
                        );
                    }}
                    ListEmptyComponent={<Typography align="center" style={{ marginTop: 40 }}>No orders found.</Typography>}
                    ListFooterComponent={isFetching && page > 1 ? <ActivityIndicator style={{ padding: 20 }} color={colors.primary} /> : null}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}

            {/* Sheets */}
            <OrderDetailSheet
                ref={orderSheet.ref}
                order={selectedOrder}
                onClose={() => orderSheet.close()}
                onChat={handleChat}
                onReview={handleReview}
            />

            <ReviewBusinessSheet
                ref={reviewSheet.ref}
                order={selectedOrder}
                onSuccess={handleReviewSuccess}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },
    header: {
        paddingBottom: 24,
    },
    refreshBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    backBtn: {
        padding: 8,
    },
    tabs: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 14,
        gap: 4,
    },
    tab: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabActiveShadow: {
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 4,
        // elevation: 3,
    },
    orderCard: {
        padding: 16,
        gap: 12,
    },
    orderTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    orderImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
    },
    placeholderImage: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#F5F5F5',
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.05,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardChatBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
});
