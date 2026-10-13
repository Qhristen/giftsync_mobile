import NotificationListSkeleton from '@/components/skeletons/NotificationListSkeleton';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useDeleteNotificationMutation, useGetNotificationsQuery, useMarkAllAsReadMutation, useMarkAsReadMutation } from '@/store/api/notificationApi';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

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

    const handleNotificationPress = async (id: string, isRead: boolean) => {
        if (isRead) return;
        try {
            await markAsRead(id).unwrap();
        } catch {
            toast.error('Could not mark as read');
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
            <View style={[styles.header, { paddingTop: insets.top + 10, paddingHorizontal: spacing.xl }]}>
                <View style={styles.headerTop}>
                    <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={colors.ink} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>YOUR GIFT PINBOARD</Typography>
                        <Typography variant="h1">Little updates</Typography>
                    </View>
                </View>

                <View style={[styles.mailbox, { backgroundColor: colors.lilac, borderColor: colors.ink, shadowColor: colors.ink }]}>
                    <View style={[styles.mailIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={Notification01Icon} size={27} color={colors.primary} />
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
                        <HugeiconsIcon icon={TickDouble02Icon} size={17} color="#17151D" />
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
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    onRefresh={refetch}
                    refreshing={isFetching}
                    renderItem={({ item, index }) => {
                        const config = getIcon(item.type);
                        const noteColor = paperColors[index % paperColors.length];
                        const leftAction = () => (
                            <View style={[styles.swipeAction, styles.leftAction, { backgroundColor: colors.primary }]}>
                                <HugeiconsIcon icon={TickDouble02Icon} size={22} color="#FFFFFF" />
                                <Typography variant="caption" color="#FFFFFF">Read</Typography>
                            </View>
                        );
                        const rightAction = () => (
                            <View style={[styles.swipeAction, styles.rightAction, { backgroundColor: colors.error }]}>
                                <HugeiconsIcon icon={Delete02Icon} size={22} color="#FFFFFF" />
                                <Typography variant="caption" color="#FFFFFF">Delete</Typography>
                            </View>
                        );

                        return (
                            <Animated.View entering={FadeInDown.delay(Math.min(index * 55, 300)).duration(300)} style={{ marginHorizontal: spacing.xl, marginBottom: 16 }}>
                                <Swipeable
                                    renderLeftActions={item.isRead ? undefined : leftAction}
                                    renderRightActions={rightAction}
                                    onSwipeableOpen={(direction) => direction === 'left' ? handleNotificationPress(item.id, item.isRead) : handleDelete(item.id)}
                                >
                                    <Pressable
                                        onPress={() => handleNotificationPress(item.id, item.isRead)}
                                        style={({ pressed }) => [
                                            styles.note,
                                            {
                                                backgroundColor: item.isRead ? colors.surface : noteColor,
                                                borderColor: colors.ink,
                                                shadowColor: item.isRead ? colors.textMuted : colors.ink,
                                                transform: [{ rotate: index % 2 ? '0.6deg' : '-0.6deg' }],
                                            },
                                            pressed && styles.pressed,
                                        ]}
                                    >
                                        <View style={[styles.pin, { backgroundColor: item.isRead ? colors.surfaceRaised : colors.accent, borderColor: colors.ink }]} />
                                        <View style={[styles.noteIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                            <HugeiconsIcon icon={config.icon} size={22} color={config.color} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.noteMeta}>
                                                <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>{item.type.toUpperCase()}</Typography>
                                                {!item.isRead && <View style={[styles.unreadLabel, { backgroundColor: colors.ink }]}><Typography variant="caption" color={colors.surface}>NEW</Typography></View>}
                                            </View>
                                            <Typography variant="h4" numberOfLines={2}>{item.title}</Typography>
                                            <Typography variant="body" color={colors.textSecondary} numberOfLines={3} style={{ marginTop: 4 }}>{item.body}</Typography>
                                            <View style={styles.timeRow}>
                                                <Typography variant="caption" color={colors.textSecondary}>{format(new Date(item.createdAt), 'dd MMM yyyy')}</Typography>
                                                <View style={[styles.timeDot, { backgroundColor: colors.textMuted }]} />
                                                <Typography variant="caption" color={colors.textSecondary}>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</Typography>
                                            </View>
                                        </View>
                                    </Pressable>
                                </Swipeable>
                            </Animated.View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={[styles.emptyState, { marginHorizontal: spacing.xl, backgroundColor: colors.mint, borderColor: colors.ink }]}>
                            <View style={[styles.emptyIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={NotificationOff01Icon} size={32} color={colors.primary} />
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
    header: { paddingBottom: 12 },
    headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backButton: { width: 44, height: 44, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 0.8 },
    mailbox: { minHeight: 100, borderWidth: 1.5, borderRadius: 22, marginTop: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowOffset: { width: 4, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
    mailIcon: { width: 50, height: 50, borderWidth: 1.5, borderRadius: 16, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
    clearButton: { height: 38, borderWidth: 1.25, borderRadius: 12, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
    note: { minHeight: 144, borderWidth: 1.5, borderRadius: 20, padding: 16, paddingTop: 20, flexDirection: 'row', gap: 13, shadowOffset: { width: 4, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
    pin: { position: 'absolute', width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, top: -7, left: '50%' },
    noteIcon: { width: 44, height: 44, borderRadius: 14, borderWidth: 1.25, alignItems: 'center', justifyContent: 'center' },
    noteMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    unreadLabel: { borderRadius: 7, paddingHorizontal: 6, paddingVertical: 2 },
    timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    timeDot: { width: 3, height: 3, borderRadius: 2 },
    swipeAction: { width: 82, height: '100%', alignItems: 'center', justifyContent: 'center', gap: 4 },
    leftAction: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
    rightAction: { borderTopRightRadius: 20, borderBottomRightRadius: 20 },
    emptyState: { marginTop: 24, borderWidth: 1.5, borderRadius: 24, padding: 30, alignItems: 'center', gap: 8 },
    emptyIcon: { width: 62, height: 62, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    pressed: { opacity: 0.85, transform: [{ translateY: 2 }] },
});
