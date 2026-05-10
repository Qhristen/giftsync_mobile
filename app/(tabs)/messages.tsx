import ConversationItem from '@/components/chat/ConversationItem';
import ConversationListSkeleton from '@/components/skeletons/ConversationListSkeleton';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetConversationsQuery } from '@/store/api/chatApi';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { selectUnreadCount } from '@/store/slices/chatSlice';
import { useAppSelector } from '@/store/hooks';
import { moderateScale } from '@/utils/scaling';

export default function MessagesScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const unreadCount = useAppSelector(selectUnreadCount);
    
    const {
        data,
        isLoading,
        isFetching,
        refetch
    } = useGetConversationsQuery({ page: 1, limit: 50 });

    const conversations = React.useMemo(() => {
        if (!data?.items) return [];
        return [...data.items].sort((a, b) => {
            const aHasUnread = (a.unreadCount || 0) > 0;
            const bHasUnread = (b.unreadCount || 0) > 0;

            if (aHasUnread && !bHasUnread) return -1;
            if (!aHasUnread && bHasUnread) return 1;

            // If both have same unread status, sort by date descending
            const aDate = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const bDate = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return bDate - aDate;
        });
    }, [data?.items]);

    const onRefresh = React.useCallback(() => {
        refetch();
    }, [refetch]);

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingVertical: spacing.md }]}>
                    <Typography variant="h1">Messages</Typography>
                </View>
                <ConversationListSkeleton />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View entering={FadeInDown.duration(600)} style={[styles.header, { paddingHorizontal: spacing.xl }]}>
                <View style={styles.titleContainer}>
                    <Typography variant="h1">Messages</Typography>
                    {unreadCount > 0 && (
                        <View style={[styles.headerBadge, { backgroundColor: colors.primary }]}>
                            <Typography variant="caption" color="#FFFFFF" style={styles.headerBadgeText}>
                                {unreadCount}
                            </Typography>
                        </View>
                    )}
                </View>
                <Pressable
                    onPress={onRefresh}
                    style={({ pressed }) => [
                        styles.refreshBtn,
                        { backgroundColor: colors.surface },
                        pressed && { opacity: 0.7 }
                    ]}
                >
                    <Ionicons
                        name="refresh"
                        size={20}
                        color={isFetching ? colors.primary : colors.textPrimary}
                    />
                </Pressable>
            </Animated.View>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <Animated.View
                        entering={FadeInDown.delay(index * 100).duration(500)}
                    >
                        <ConversationItem
                            conversation={item}
                            onPress={() => router.push(`/chat/${item.id}`)}
                        />
                    </Animated.View>
                )}
                contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={() => (
                    <View style={styles.empty}>
                        <Typography variant="body" color={colors.textSecondary}>
                            No conversations yet
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
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerBadge: {
        minWidth: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginTop: 4,
    },
    headerBadgeText: {
        fontSize: moderateScale(12),
        fontWeight: 'bold',
    },
    refreshBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        flexGrow: 1,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
});
