import MessageBubble from '@/components/chat/MessageBubble';
import MessageOptionsSheet from '@/components/sheets/MessageOptionsSheet';
import Avatar from '@/components/ui/Avatar';
import { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Typography from '@/components/ui/Typography';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { useGetConversationQuery, useGetMessagesQuery, useMarkConversationAsReadMutation } from '@/store/api/chatApi';
import { useGetProfileQuery } from '@/store/api/userApi';
import { ChatMessage } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    TextInput,
    View
} from 'react-native';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';


export default function ChatDetailScreen() {
    const { id: conversationId } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const [messageText, setMessageText] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const optionsSheetRef = useRef<BottomSheetRef>(null);
    const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
    const socketService = useChatSocket();

    const renderScrollComponent = React.useCallback((props: any) => (
        <KeyboardChatScrollView
            {...props}
            keyboardLiftBehavior="whenAtEnd"
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
        />
    ), []);

    const { data: profile } = useGetProfileQuery();
    const { data: conversation, isLoading: isConvLoading } = useGetConversationQuery(conversationId);
    const {
        data,
        isLoading: isMessagesLoading,
        refetch
    } = useGetMessagesQuery({ conversationId, limit: 50 });

    const [markAsRead] = useMarkConversationAsReadMutation();
    const typingUsers = useSelector((state: RootState) => state.chat.typingUsers[conversationId] || []);

    const messages = data?.items || [];
    const isLoading = isConvLoading || isMessagesLoading;

    const participants = conversation?.participants?.filter(p => p.id !== profile?.id) || [];

    const displayName = conversation?.order?.item?.product?.name || 'Chat';
    const avatarSize = 28;
    const overlap = 10;
    const groupWidth = participants.length > 0
        ? avatarSize + (participants.length - 1) * (avatarSize - overlap)
        : avatarSize;

    useEffect(() => {
        if (conversationId) {
            socketService.joinConversation(conversationId);
            markAsRead(conversationId);
            socketService.markAsRead(conversationId);

            return () => {
                socketService.leaveConversation(conversationId);
            };
        }
    }, [conversationId]);

    const handleSend = async () => {
        if (!messageText.trim()) return;

        const content = messageText.trim();
        setMessageText('');
        socketService.sendTyping(conversationId, false);

        setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);

        try {
            await socketService.sendMessage(conversationId, content);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Optionally show error toast
        }
    };

    const handleTyping = (text: string) => {
        setMessageText(text);
        if (text.length > 0) {
            socketService.sendTyping(conversationId, true);
        } else {
            socketService.sendTyping(conversationId, false);
        }
    };

    const handleLongPress = (message: ChatMessage) => {
        setSelectedMessage(message);
        optionsSheetRef.current?.present();
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[
                styles.header,
                {
                    paddingTop: insets.top,
                    backgroundColor: colors.surface,
                    borderBottomColor: colors.border,
                    // borderBottomWidth: 1,
                }
            ]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
                </Pressable>

                <View style={styles.headerTitle}>
                    <View style={[styles.headerAvatarGroup, { width: groupWidth, height: avatarSize }]}>
                        {participants.map((participant, index) => (
                            <Avatar
                                key={participant.id}
                                uri={participant.avatarUrl}
                                name={participant.name}
                                size={avatarSize}
                                style={{
                                    position: 'absolute',
                                    left: index * (avatarSize - overlap),
                                    zIndex: participants.length - index,
                                    borderWidth: 1.5,
                                    borderColor: colors.surface,
                                }}
                            />
                        ))}
                    </View>
                    <View>
                        <Typography variant="bodyBold">{displayName}</Typography>
                        {typingUsers.length > 0 && (
                            <Typography variant="caption" color={colors.primary}>typing...</Typography>
                        )}
                    </View>
                </View>

                <Pressable onPress={() => { }} style={styles.headerRightBtn}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <FlatList
                ref={flatListRef}
                data={[...messages].reverse()}
                inverted={true}
                showsVerticalScrollIndicator={false}
                renderScrollComponent={renderScrollComponent}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <MessageBubble
                        message={item}
                        isOwnMessage={item.sender.id === profile?.id}
                        onLongPress={handleLongPress}
                    />
                )}
                style={{ flex: 1 }}
                contentContainerStyle={[styles.messageList, { paddingBottom: spacing.lg }]}
            />

            <KeyboardStickyView offset={{ opened: insets.bottom }}>
                <View style={[
                    styles.inputContainer,
                    {
                        borderTopColor: colors.border,
                        backgroundColor: colors.surface,
                        paddingBottom: insets.bottom + 12,
                    }
                ]}>
                    <Pressable style={styles.attachBtn}>
                        <Ionicons name="add-circle-outline" size={28} color={colors.textSecondary} />
                    </Pressable>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            placeholder="Type a message..."
                            value={messageText}
                            onChangeText={handleTyping}
                            placeholderTextColor={colors.textMuted}
                            style={[
                                styles.input,
                                {
                                    color: colors.textPrimary,
                                    backgroundColor: colors.surfaceRaised,
                                }
                            ]}
                        />
                    </View>
                    <Pressable
                        onPress={handleSend}
                        disabled={!messageText.trim()}
                        style={[
                            styles.sendBtn,
                            {
                                backgroundColor: messageText.trim() ? colors.primary : colors.surfaceRaised,
                            }
                        ]}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={messageText.trim() ? '#FFFFFF' : colors.textMuted}
                        />
                    </Pressable>
                </View>
            </KeyboardStickyView>

            <MessageOptionsSheet
                ref={optionsSheetRef}
                textToCopy={selectedMessage?.content || ''}
                onClose={() => setSelectedMessage(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingBottom: 10,
    },
    backBtn: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginLeft: 4,
    },
    headerAvatarGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerRightBtn: {
        padding: 8,
    },
    messageList: {
        paddingVertical: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        // borderTopWidth: 1,
    },
    attachBtn: {
        padding: 4,
    },
    inputWrapper: {
        flex: 1,
        marginHorizontal: 8,
    },
    input: {
        height: 44,
        borderRadius: 22,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
