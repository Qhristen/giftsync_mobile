import OrderDetailSheet from '@/components/sheets/OrderDetailSheet';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { useCreateConversationMutation } from '@/store/api/chatApi';
import { useGetOrdersQuery } from '@/store/api/orderApi';
import { useAppSelector } from '@/store/hooks';
import { Order } from '@/types';
import { formatDate } from '@/utils/dateUtils';
import { formatNGN } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

export default function OrderListScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const orderSheet = useBottomSheet();

    const { data: orders = [], isLoading, refetch } = useGetOrdersQuery();
    const [createChat, { isLoading: isCreatingChat }] = useCreateConversationMutation();
    console.log(selectedOrder, "selected")
    const handleChat = async (orderId: string) => {
        try {
            const chat = await createChat({
                orderId,
                participantIds: [selectedOrder?.business?.userId as string]
            }).unwrap();
            router.push(`/chat/${chat.id}`);
        } catch (error) {
            console.error('Failed to create/join chat:', error);
        }
    };

    const filteredOrders = orders.filter(o =>
        activeTab === 'Active' ? (o.status !== 'Delivered' && o.status !== 'Cancelled') : (o.status === 'Delivered' || o.status === 'Cancelled')
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { padding: spacing.xl }]}>
                <View style={styles.headerTop}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </Pressable>
                    <Typography variant="h1">Orders</Typography>
                </View>

                {/* Tab Switcher */}
                <View style={[styles.tabs, { backgroundColor: colors.surfaceRaised }]}>
                    {['Active', 'History'].map((tab) => (
                        <Pressable
                            key={tab}
                            onPress={() => setActiveTab(tab as any)}
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
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlashList
                    data={filteredOrders}
                    // estimatedItemSize={120}
                    keyExtractor={(item) => item.id}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    renderItem={({ item }) => {
                        const productName = item.item.product.name;
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
                                    <View style={styles.placeholderImage} />
                                    <View style={{ flex: 1 }}>
                                        <Typography variant="bodyBold">{productName}</Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>To {item.recipientName}</Typography>
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
                                        <Typography variant="label" color={colors.primary}>{formatNGN(item.total)}</Typography>
                                    </View>

                                    <Pressable
                                        onPress={() => handleChat(item.id)}
                                        style={[styles.cardChatBtn, { backgroundColor: colors.primary + '10' }]}
                                    >
                                        <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
                                        <Typography variant="label" color={colors.primary} style={{ fontSize: 12 }}>Chat Vendor</Typography>
                                    </Pressable>
                                </View>
                            </Card>
                        );
                    }}
                    ListEmptyComponent={<Typography align="center" style={{ marginTop: 40 }}>No orders found.</Typography>}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}

            {/* Sheets */}
            <OrderDetailSheet
                ref={orderSheet.ref}
                order={selectedOrder}
                onClose={() => orderSheet.close()}
                onChat={handleChat}
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
