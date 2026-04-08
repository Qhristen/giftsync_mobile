import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useDeleteNotificationMutation, useGetNotificationsQuery, useMarkAllAsReadMutation, useMarkAsReadMutation } from '@/store/api/notificationApi';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { toast } from 'sonner-native';

export default function NotificationsScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const { data: data, isLoading, refetch } = useGetNotificationsQuery({ page: 1, limit: 50 });
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const [markAsRead] = useMarkAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();

    const notifications = data?.items || [];

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead().unwrap();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleNotificationPress = async (id: string, isRead: boolean) => {
        if (!isRead) {
            try {
                await markAsRead(id).unwrap();
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotification(id).unwrap();
            toast.success('Notification deleted');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            toast.error('Failed to delete');
        }
    };

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'success':
            case 'delivered':
                return { name: 'checkmark-circle', color: colors.success };
            case 'warning':
            case 'upcoming':
                return { name: 'time', color: '#F59E0B' };
            case 'order':
            case 'transaction':
                return { name: 'receipt', color: colors.primary };
            default: return { name: 'information-circle', color: colors.primary };
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h2">Notifications</Typography>
                <Pressable onPress={handleMarkAllRead}>
                    <Typography variant="bodyBold" color={colors.primary}>Mark All Read</Typography>
                </Pressable>
            </View>

            {isLoading && notifications.length === 0 ? (
                <View style={[styles.emptyContainer, { flex: 1 }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlashList
                    data={notifications}
                    // estimatedItemSize={90}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: spacing.xl }}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    renderItem={({ item, index }) => {
                        const iconConfig = getIcon(item.type);
                        const timeAgo = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true });

                        const renderLeftActions = () => (
                            <View style={[styles.swipeAction, { backgroundColor: colors.primary }]}>
                                <Ionicons name="checkmark-done" size={24} color="#FFF" />
                                <Typography variant="caption" color="#FFF">Read</Typography>
                            </View>
                        );

                        const renderRightActions = () => (
                            <View style={[styles.swipeAction, { backgroundColor: colors.error }]}>
                                <Ionicons name="trash" size={24} color="#FFF" />
                                <Typography variant="caption" color="#FFF">Delete</Typography>
                            </View>
                        );

                        return (
                            <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
                                <Swipeable
                                    renderLeftActions={item.isRead ? undefined : renderLeftActions}
                                    renderRightActions={renderRightActions}
                                    onSwipeableOpen={(direction) => {
                                        if (direction === 'left') {
                                            handleNotificationPress(item.id, item.isRead);
                                        } else if (direction === 'right') {
                                            handleDelete(item.id);
                                        }
                                    }}
                                >
                                    <Pressable
                                        onPress={() => handleNotificationPress(item.id, item.isRead)}
                                        style={({ pressed }) => [
                                            styles.notificationItem,
                                            { backgroundColor: item.isRead ? colors.background : colors.surfaceRaised },
                                            pressed && { opacity: 0.7 }
                                        ]}
                                    >
                                        <View style={[styles.iconContainer, { backgroundColor: item.isRead ? colors.surfaceRaised : colors.surface }]}>
                                            <Ionicons name={iconConfig.name as any} size={24} color={iconConfig.color} />
                                        </View>
                                        <View style={styles.textContainer}>
                                            <View style={styles.titleRow}>
                                                <Typography variant="bodyBold" color={colors.textPrimary}>{item.title}</Typography>
                                                <Typography variant="caption" color={colors.textSecondary}>{timeAgo}</Typography>
                                            </View>
                                            <Typography variant="body" color={colors.textSecondary} style={{ marginTop: 4 }}>
                                                {item.body}
                                            </Typography>
                                        </View>
                                        {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                                    </Pressable>
                                </Swipeable>
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
            )}
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
    swipeAction: {
        width: 80,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
});
