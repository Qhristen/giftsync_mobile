import NotificationListSkeleton from '@/components/skeletons/NotificationListSkeleton';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useDeleteNotificationMutation, useGetNotificationsQuery, useMarkAllAsReadMutation, useMarkAsReadMutation } from '@/store/api/notificationApi';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01Icon,
    Delete02Icon,
    InformationCircleIcon,
    Invoice01Icon,
    NotificationOff01Icon,
    Tick01Icon,
    TickDouble02Icon,
    Time02Icon
} from '@hugeicons/core-free-icons';
import { FlashList } from '@shopify/flash-list';
import { format, formatDistanceToNow } from 'date-fns';
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

    React.useEffect(() => {
        handleMarkAllRead();
    }, []);

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
                return { name: Tick01Icon, color: colors.success };
            case 'warning':
            case 'upcoming':
                return { name: Time02Icon, color: '#F59E0B' };
            case 'order':
            case 'transaction':
                return { name: Invoice01Icon, color: colors.primary };
            default: return { name: InformationCircleIcon, color: colors.primary };
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h2">Notifications</Typography>
                <Pressable onPress={handleMarkAllRead}>
                    <Typography variant="bodyBold" color={colors.primary}>Mark All Read</Typography>
                </Pressable>
            </View>


            {isLoading && notifications.length === 0 ? (
                <View style={{ flex: 1, paddingTop: 20 }}>
                    <NotificationListSkeleton />
                </View>
            ) : (
                <FlashList
                    data={notifications}
                    // estimatedItemSize={90}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: spacing.xl }}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    renderItem={({ item, index }) => {
                        const iconConfig = getIcon(item.type);
                        const timeAgo = format(new Date(item.createdAt), 'dd/MM/yyyy');


                        const renderLeftActions = () => (
                            <View style={[styles.swipeAction, { backgroundColor: colors.primary }]}>
                                <HugeiconsIcon icon={TickDouble02Icon} size={24} color="#FFF" />
                                <Typography variant="caption" color="#FFF">Read</Typography>
                            </View>
                        );

                        const renderRightActions = () => (
                            <View style={[styles.swipeAction, { backgroundColor: colors.error }]}>
                                <HugeiconsIcon icon={Delete02Icon} size={24} color="#FFF" />
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
                                            <HugeiconsIcon icon={iconConfig.name} size={24} color={iconConfig.color} />
                                        </View>
                                        <View style={styles.textContainer}>
                                            <View style={styles.titleRow}>
                                                <Typography variant="bodyBold" numberOfLines={2} color={colors.textSecondary}>{item.title}</Typography>
                                                <Typography variant="caption" color={colors.textSecondary}>{timeAgo}</Typography>
                                            </View>
                                            <Typography variant="body" numberOfLines={2} color={colors.textSecondaryForeground} style={{ marginTop: 4 }}>
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
                            <HugeiconsIcon icon={NotificationOff01Icon} size={64} color={colors.textMuted} />
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
