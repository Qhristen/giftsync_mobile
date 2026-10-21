import NotificationListSkeleton from '@/components/skeletons/NotificationListSkeleton';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useDeleteNotificationMutation, useGetNotificationsQuery, useMarkAllAsReadMutation, useMarkAsReadMutation } from '@/store/api/notificationApi';
import { Notification } from '@/types';
import {
    ArrowLeft01Icon,
    Delete02Icon,
    InformationCircleIcon,
    Invoice01Icon,
    Notification01Icon,
    NotificationOff01Icon,
    Tick01Icon,
    TickDouble02Icon,
    Time02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FlashList } from '@shopify/flash-list';
import { format, formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { moderateScale } from '@/utils/scaling';

export default function NotificationsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { data, isLoading, isFetching, refetch } = useGetNotificationsQuery({ page: 1, limit: 50 });
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const [markAsRead] = useMarkAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();
    const notifications = data?.items || [];
    const unreadCount = notifications.filter((item) => !item.isRead).length;

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead().unwrap();
            toast.success('Inbox cleared', { description: 'Everything is marked as read.' });
        } catch {
            toast.error('Could not update notifications');
        }
    };

    const markNotificationRead = async (id: string, isRead: boolean) => {
        if (!isRead) {
            try {
                await markAsRead(id).unwrap();
            } catch {
                toast.error('Could not mark as read');
            }
        }
    };

    const handleNotificationPress = (notification: Notification) => {
        void markNotificationRead(notification.id, notification.isRead);

        const action = String(notification.data?.action || '').toUpperCase();
        const conversationId = notification.data?.conversationId;
        const orderId = notification.data?.orderId;
        const giftRequestId = notification.data?.giftRequestId;

        if (action === 'OPEN_CONVERSATION' && conversationId) {
            router.push(`/chat/${String(conversationId)}`);
        } else if (action === 'PAY_ORDER' && orderId) {
            router.push({
                pathname: '/checkout/payment',
                params: {
                    orderId: String(orderId),
                    ...(giftRequestId ? { giftRequestId: String(giftRequestId) } : {}),
                },
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotification(id).unwrap();
            toast.success('Notification deleted');
        } catch {
            toast.error('Failed to delete');
        }
    };

    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'success':
            case 'delivered': return { icon: Tick01Icon, color: colors.success };
            case 'warning':
            case 'upcoming': return { icon: Time02Icon, color: '#B86B00' };
            case 'order':
            case 'transaction': return { icon: Invoice01Icon, color: colors.primary };
            default: return { icon: InformationCircleIcon, color: colors.primary };
        }
    };

    const paperColors = [colors.lemon, colors.mint, colors.lilac, colors.peach];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + moderateScale(10), paddingHorizontal: spacing.xl }]}>
                <View style={styles.headerTop}>
                    <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={moderateScale(22)} color={colors.ink} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>YOUR GIFT PINBOARD</Typography>
                        <Typography variant="h1">Little updates</Typography>
                    </View>
                </View>

                <View style={[styles.mailbox, { backgroundColor: colors.lilac, borderColor: colors.ink }]}>
                    <View style={[styles.mailIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={Notification01Icon} size={moderateScale(27)} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Typography variant="h2">{unreadCount}</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>{unreadCount === 1 ? 'unread note waiting' : 'unread notes waiting'}</Typography>
                    </View>
                    <Pressable
                        onPress={handleMarkAllRead}
                        disabled={unreadCount === 0}
                        style={[styles.clearButton, { backgroundColor: colors.accent, borderColor: colors.ink }, unreadCount === 0 && { opacity: 0.45 }]}
                    >
                        <HugeiconsIcon icon={TickDouble02Icon} size={moderateScale(17)} color="#17151D" />
                        <Typography variant="caption" color="#17151D" style={styles.overline}>CLEAR</Typography>
                    </Pressable>
                </View>
            </View>

            {isLoading && !notifications.length ? (
                <NotificationListSkeleton />
            ) : (
                <FlashList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingTop: moderateScale(12), paddingBottom: moderateScale(40) }}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refetch}
                    refreshing={isFetching}
                    renderItem={({ item, index }) => {
                        const config = getIcon(item.type);
                        const noteColor = paperColors[index % paperColors.length];
                        const leftAction = () => (
                            <View style={[styles.swipeAction, styles.leftAction, { backgroundColor: colors.primary }]}>
                                <HugeiconsIcon icon={TickDouble02Icon} size={moderateScale(22)} color="#FFFFFF" />
                                <Typography variant="caption" color="#FFFFFF">Read</Typography>
                            </View>
                        );
                        const rightAction = () => (
                            <View style={[styles.swipeAction, styles.rightAction, { backgroundColor: colors.error }]}>
                                <HugeiconsIcon icon={Delete02Icon} size={moderateScale(22)} color="#FFFFFF" />
                                <Typography variant="caption" color="#FFFFFF">Delete</Typography>
                            </View>
                        );

                        return (
                            <View style={{ marginHorizontal: spacing.xl, marginBottom: moderateScale(16) }}>
                                <Swipeable
                                    renderLeftActions={item.isRead ? undefined : leftAction}
                                    renderRightActions={rightAction}
                                    onSwipeableOpen={(direction) => direction === 'left' ? markNotificationRead(item.id, item.isRead) : handleDelete(item.id)}
                                >
                                    <Pressable
                                        onPress={() => handleNotificationPress(item)}
                                        style={({ pressed }) => [
                                            styles.note,
                                            {
                                                backgroundColor: item.isRead ? colors.surface : noteColor,
                                                borderColor: colors.ink,
                                                transform: [{ rotate: index % 2 ? '0.6deg' : '-0.6deg' }],
                                            },
                                            pressed && styles.pressed,
                                        ]}
                                    >
                                        <View style={[styles.pin, { backgroundColor: item.isRead ? colors.surfaceRaised : colors.accent, borderColor: colors.ink }]} />
                                        <View style={[styles.noteIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                            <HugeiconsIcon icon={config.icon} size={moderateScale(22)} color={config.color} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.noteMeta}>
                                                <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>{item.type.toUpperCase()}</Typography>
                                                {!item.isRead && <View style={[styles.unreadLabel, { backgroundColor: colors.ink }]}><Typography variant="caption" color={colors.surface}>NEW</Typography></View>}
                                            </View>
                                            <Typography variant="h4" numberOfLines={2}>{item.title}</Typography>
                                            <Typography variant="body" color={colors.textSecondary} numberOfLines={3} style={{ marginTop: moderateScale(4) }}>{item.body}</Typography>
                                            <View style={styles.timeRow}>
                                                <Typography variant="caption" color={colors.textSecondary}>{format(new Date(item.createdAt), 'dd MMM yyyy')}</Typography>
                                                <View style={[styles.timeDot, { backgroundColor: colors.textMuted }]} />
                                                <Typography variant="caption" color={colors.textSecondary}>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</Typography>
                                            </View>
                                        </View>
                                    </Pressable>
                                </Swipeable>
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={[styles.emptyState, { marginHorizontal: spacing.xl, backgroundColor: colors.mint, borderColor: colors.ink }]}>
                            <View style={[styles.emptyIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={NotificationOff01Icon} size={moderateScale(32)} color={colors.primary} />
                            </View>
                            <Typography variant="h3">The pinboard is clear.</Typography>
                            <Typography variant="body" color={colors.textSecondary} align="center">Order updates and thoughtful reminders will land here.</Typography>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingBottom: moderateScale(12) },
    headerTop: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
    backButton: { width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(14), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(0.8) },
    mailbox: { minHeight: moderateScale(100), borderWidth: 1.5, borderRadius: moderateScale(22), marginTop: moderateScale(20), padding: moderateScale(14), flexDirection: 'row', alignItems: 'center', gap: moderateScale(12), },
    mailIcon: { width: moderateScale(50), height: moderateScale(50), borderWidth: 1.5, borderRadius: moderateScale(16), alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
    clearButton: { height: moderateScale(38), borderWidth: 1.25, borderRadius: moderateScale(12), paddingHorizontal: moderateScale(10), flexDirection: 'row', alignItems: 'center', gap: moderateScale(5) },
    note: { minHeight: moderateScale(144), borderWidth: 1.5, borderRadius: moderateScale(20), padding: moderateScale(16), paddingTop: moderateScale(20), flexDirection: 'row', gap: moderateScale(13), },
    pin: { position: 'absolute', width: moderateScale(16), height: moderateScale(16), borderRadius: moderateScale(8), borderWidth: 1.5, top: moderateScale(-7), left: '50%' },
    noteIcon: { width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(14), borderWidth: 1.25, alignItems: 'center', justifyContent: 'center' },
    noteMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: moderateScale(4) },
    unreadLabel: { borderRadius: moderateScale(7), paddingHorizontal: moderateScale(6), paddingVertical: moderateScale(2) },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(6), marginTop: moderateScale(10) },
    timeDot: { width: moderateScale(3), height: moderateScale(3), borderRadius: moderateScale(2) },
    swipeAction: { width: moderateScale(82), height: '100%', alignItems: 'center', justifyContent: 'center', gap: moderateScale(4) },
    leftAction: { borderTopLeftRadius: moderateScale(20), borderBottomLeftRadius: moderateScale(20) },
    rightAction: { borderTopRightRadius: moderateScale(20), borderBottomRightRadius: moderateScale(20) },
    emptyState: { marginTop: moderateScale(24), borderWidth: 1.5, borderRadius: moderateScale(24), padding: moderateScale(30), alignItems: 'center', gap: moderateScale(8) },
    emptyIcon: { width: moderateScale(62), height: moderateScale(62), borderRadius: moderateScale(20), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: moderateScale(4) },
    pressed: { opacity: 0.85, transform: [{ translateY: moderateScale(2) }] },
});
