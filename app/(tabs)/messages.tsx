import ConversationItem from '@/components/chat/ConversationItem';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetConversationsQuery } from '@/store/api/chatApi';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function MessagesScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const {
        data,
        isLoading,
        isFetching,
        refetch
    } = useGetConversationsQuery({ page: 1, limit: 50 });

    const conversations = data || [];

    const onRefresh = React.useCallback(() => {
        refetch();
    }, [refetch]);

    if (isLoading && !isFetching) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View entering={FadeInDown.duration(600)} style={[styles.header, { padding: spacing.xl }]}>
                <Typography variant="h1">Messages</Typography>
            </Animated.View>

            <FlatList
                data={conversations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ConversationItem
                        conversation={item}
                        onPress={() => router.push(`/chat/${item.id}`)}
                    />
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
        paddingTop: 30, // Account for status bar
    },
    header: {
        marginBottom: 8,
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
