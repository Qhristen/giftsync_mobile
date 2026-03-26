import OrderDetailSheet from '@/components/sheets/OrderDetailSheet';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

interface Order {
    id: string;
    productName: string;
    recipientName: string;
    status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
    date: string;
    price: string;
}

const mockOrders: Order[] = [
    { id: '1', productName: 'Premium Leather Wallet', recipientName: 'Alex Johnson', status: 'Processing', date: 'March 22, 2026', price: 'NGN 14,500' },
    { id: '2', productName: 'Gourmet Chocolate Box', recipientName: 'Sam Smith', status: 'Delivered', date: 'February 14, 2026', price: 'NGN 15,000' },
    { id: '3', productName: 'Scented Candle', recipientName: 'Sarah Doe', status: 'Delivered', date: 'January 25, 2026', price: 'NGN 8,000' },
];

export default function OrderListScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const orderSheet = useBottomSheet();

    const filteredOrders = mockOrders.filter(o =>
        activeTab === 'Active' ? (o.status !== 'Delivered') : (o.status === 'Delivered')
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

            <FlatList
                data={filteredOrders}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Card
                        variant="outline"
                        style={[styles.orderCard, { marginHorizontal: spacing.xl }]}
                        onPress={() => {
                            setSelectedOrder(item);
                            orderSheet.open();
                        }}
                    >
                        <View style={styles.orderTop}>
                            <View style={styles.placeholderImage} />
                            <View style={{ flex: 1 }}>
                                <Typography variant="bodyBold">{item.productName}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>To {item.recipientName}</Typography>
                            </View>
                            <Badge
                                label={item.status}
                                variant={item.status === 'Delivered' ? 'success' : 'amber'}
                                size="xs"
                            />
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.orderFooter}>
                            <Typography variant="caption" color={colors.textMuted}>{item.date}</Typography>
                            <Typography variant="label" color={colors.primary}>{item.price}</Typography>
                        </View>
                    </Card>
                )}
                ListEmptyComponent={<Typography align="center" style={{ marginTop: 40 }}>No orders found.</Typography>}
                contentContainerStyle={{ gap: 16, paddingBottom: 100 }}
            />

            {/* Sheets */}
            <OrderDetailSheet
                ref={orderSheet.ref}
                order={selectedOrder}
                onClose={() => orderSheet.close()}
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
});
