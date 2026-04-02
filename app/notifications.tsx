import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const INITIAL_NOTIFICATIONS = [
    { id: '1', title: 'Gift Delivered!', message: "Alex's Birthday gift has been successfully delivered and signed for.", time: '10m ago', isRead: false, type: 'success' },
    { id: '2', title: 'Upcoming Occasion', message: "Sarah's Anniversary is in 3 days. Send a gift now to arrive on time.", time: '2h ago', isRead: false, type: 'warning' },
    { id: '3', title: 'Coins Added', message: 'You have successfully topped up 50 coins to your wallet.', time: '1d ago', isRead: true, type: 'info' },
    { id: '4', title: 'Order Update', message: 'Your order #ORD-089A is now out for delivery.', time: '2d ago', isRead: true, type: 'info' },
    { id: '5', title: 'System', message: 'Welcome to GiftSync! Explore our marketplace and never miss an occasion.', time: '1w ago', isRead: true, type: 'info' },
];

export default function NotificationsScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return { name: 'checkmark-circle', color: colors.success };
            case 'warning': return { name: 'time', color: '#F59E0B' };
            default: return { name: 'information-circle', color: colors.primary };
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { padding: spacing.xl }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h2">Notifications</Typography>
                <Pressable onPress={markAllAsRead}>
                    <Typography variant="bodyBold" color={colors.primary}>Mark All Read</Typography>
                </Pressable>
            </View>

            <FlashList
                data={notifications}
                estimatedItemSize={90}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: spacing.xl }}
                renderItem={({ item, index }) => {
                    const iconConfig = getIcon(item.type);
                    return (
                        <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
                            <Pressable style={({ pressed }) => [
                                styles.notificationItem,
                                { backgroundColor: item.isRead ? 'transparent' : colors.surfaceRaised },
                                pressed && { opacity: 0.7 }
                            ]}>
                                <View style={[styles.iconContainer, { backgroundColor: item.isRead ? 'transparent' : colors.surface }]}>
                                    <Ionicons name={iconConfig.name as any} size={24} color={iconConfig.color} />
                                </View>
                                <View style={styles.textContainer}>
                                    <View style={styles.titleRow}>
                                        <Typography variant="bodyBold" color={colors.textPrimary}>{item.title}</Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>{item.time}</Typography>
                                    </View>
                                    <Typography variant="body" color={colors.textSecondary} style={{ marginTop: 4 }}>
                                        {item.message}
                                    </Typography>
                                </View>
                                {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                            </Pressable>
                        </Animated.View>
                    );
                }}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color={colors.textMuted} />
                        <Typography variant="body" color={colors.textSecondary} style={{ marginTop: 16 }}>
                            No notifications yet.
                        </Typography>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 20,
    },
    backBtn: {
        padding: 4,
        marginLeft: -4,
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
        marginTop: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 100,
    },
});
