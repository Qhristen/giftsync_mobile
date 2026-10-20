import ConversationItem from '@/components/chat/ConversationItem';
import ConversationListSkeleton from '@/components/skeletons/ConversationListSkeleton';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetConversationsQuery } from '@/store/api/chatApi';
import { useAppSelector } from '@/store/hooks';
import { selectUnreadCount } from '@/store/slices/chatSlice';
import { getConversationNames } from '@/utils/conversationNames';
import {
    ArrowRight01Icon,
    BubbleChatIcon,
    RefreshIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MessagesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const unreadCount = useAppSelector(selectUnreadCount);
    const currentUserId = useAppSelector((state) => state.auth.user?.id);
    const [filter, setFilter] = useState<'All' | 'Unread'>('All');
    const { data, isLoading, isFetching, refetch } = useGetConversationsQuery({ page: 1, limit: 50 });

    const conversations = React.useMemo(() => {
        const items = data?.items ? [...data.items] : [];
        return items.sort((a, b) => {
            const latestMessageDifference = new Date(b.lastMessageAt || b.updatedAt || b.createdAt).getTime()
                - new Date(a.lastMessageAt || a.updatedAt || a.createdAt).getTime();
            if (latestMessageDifference) return latestMessageDifference;
            const unreadDifference = Number((b.unreadCount || 0) > 0) - Number((a.unreadCount || 0) > 0);
            if (unreadDifference) return unreadDifference;
            return 0;
        });
    }, [data?.items]);

    const filtered = React.useMemo(
        () => filter === 'Unread' ? conversations.filter((item) => (item.unreadCount || 0) > 0) : conversations,
        [conversations, filter],
    );
    const featured = filtered[0];
    const featuredNames = featured ? getConversationNames(featured, currentUserId) : null;
    const threads = React.useMemo(
        () => featured ? filtered.slice(1) : [],
        [featured, filtered],
    );
    const openConversation = React.useCallback(
        (conversationId: string) => router.push(`/chat/${conversationId}`),
        [router],
    );
    const renderConversation = React.useCallback(
        ({ item }: { item: (typeof threads)[number] }) => (
            <ConversationItem
                conversation={item}
                currentUserId={currentUserId}
                onPress={openConversation}
            />
        ),
        [currentUserId, openConversation],
    );

    if (isLoading && !data) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 10 }]}>
                <ConversationListSkeleton />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 10, paddingHorizontal: spacing.xl }]}>
                <View style={styles.headerTop}>
                    <View style={{ flex: 1 }}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE CORRESPONDENCE DESK</Typography>
                        <Typography variant="h1">Gift talk</Typography>
                    </View>
                    <Pressable onPress={refetch} style={[styles.refreshButton, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={RefreshIcon} size={20} color="#17151D" />
                    </Pressable>
                </View>

                <Pressable
                    disabled={!featured}
                    onPress={() => featured && openConversation(featured.id)}
                    style={({ pressed }) => [styles.mailDesk, { backgroundColor: colors.lilac, borderColor: colors.ink }, pressed && styles.pressed]}
                >
                    <View style={[styles.letterBack, styles.letterOne, { backgroundColor: colors.peach, borderColor: colors.ink }]} />
                    <View style={[styles.letterBack, styles.letterTwo, { backgroundColor: colors.mint, borderColor: colors.ink }]} />
                    <View style={[styles.mailIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={BubbleChatIcon} size={27} color={colors.primary} />
                    </View>
                    <View style={styles.mailCopy}>
                        <Typography variant="caption" style={styles.overline}>{unreadCount ? `${unreadCount} NOTE${unreadCount === 1 ? '' : 'S'} WAITING` : 'ALL CAUGHT UP'}</Typography>
                        <Typography variant="h3" numberOfLines={1}>{featured?.order?.item?.product?.name || 'Your conversations'}</Typography>
                        {featuredNames && (
                            <Typography variant="caption" color={colors.textPrimary} numberOfLines={1}>
                                Sender: {featuredNames.senderName} · Receiver: {featuredNames.receiverName}
                            </Typography>
                        )}
                        <Typography variant="caption" color={colors.textPrimary} numberOfLines={1}>Last message: {featured?.lastMessagePreview || 'Order conversations will arrive here.'}</Typography>
                    </View>
                    {featured && (
                        <View style={[styles.openLetter, { backgroundColor: colors.ink }]}>
                            <HugeiconsIcon icon={ArrowRight01Icon} size={19} color={colors.surface} />
                        </View>
                    )}
                </Pressable>

                <View style={styles.deskToolbar}>
                    <View>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THREAD TRAY</Typography>
                        <Typography variant="h3">Conversations</Typography>
                    </View>
                    <View style={[styles.filters, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        {(['All', 'Unread'] as const).map((item) => (
                            <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && { backgroundColor: colors.ink }]}>
                                <Typography variant="caption" color={filter === item ? colors.surface : colors.textSecondary} style={styles.overline}>{item.toUpperCase()}</Typography>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </View>

            <FlatList
                data={threads}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 4, paddingBottom: 120, flexGrow: 1 }}
                refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={colors.primary} />}
                renderItem={renderConversation}
                ListEmptyComponent={
                    <View style={[styles.emptyTray, { marginHorizontal: spacing.xl, backgroundColor: colors.mint, borderColor: colors.ink }]}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={BubbleChatIcon} size={27} color={colors.primary} />
                        </View>
                        <Typography variant="h4">{filter === 'Unread' ? 'No unopened notes.' : featured ? 'That’s the only thread for now.' : 'The desk is quiet.'}</Typography>
                        <Typography variant="body" color={colors.textSecondary} align="center">Messages about gifts and orders will be filed here.</Typography>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingBottom: 12 },
    headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 0.8 },
    refreshButton: { width: 44, height: 44, borderWidth: 1.5, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    mailDesk: { minHeight: 134, marginTop: 18, borderWidth: 1.5, borderRadius: 23, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 13, overflow: 'hidden', },
    letterBack: { position: 'absolute', width: 72, height: 50, borderWidth: 1.25, borderRadius: 8, right: -16 },
    letterOne: { top: -8, transform: [{ rotate: '13deg' }] },
    letterTwo: { bottom: -14, transform: [{ rotate: '-10deg' }] },
    mailIcon: { width: 54, height: 54, borderWidth: 1.5, borderRadius: 17, alignItems: 'center', justifyContent: 'center', zIndex: 2, transform: [{ rotate: '-4deg' }] },
    mailCopy: { flex: 1, gap: 2, zIndex: 2 },
    openLetter: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    deskToolbar: { marginTop: 24, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },
    filters: { flexDirection: 'row', borderWidth: 1.25, borderRadius: 12, padding: 3 },
    filter: { minWidth: 49, height: 31, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
    emptyTray: { marginTop: 12, borderWidth: 1.5, borderRadius: 21, padding: 24, alignItems: 'center', gap: 7 },
    emptyIcon: { width: 54, height: 54, borderWidth: 1.5, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginBottom: 3 },
    pressed: { opacity: 0.85, transform: [{ translateY: 2 }] },
});
