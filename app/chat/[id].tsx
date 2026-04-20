import MessageBubble from '@/components/chat/MessageBubble';
import ConversationOptionsSheet from '@/components/sheets/ConversationOptionsSheet';
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
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    GestureResponderEvent,
    Pressable,
    StyleSheet,
    TextInput,
    useWindowDimensions,
    View
} from 'react-native';
import { KeyboardAvoidingView, OverKeyboardView } from 'react-native-keyboard-controller';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { toast } from 'sonner-native';



export default function ChatDetailScreen() {
    const { id: conversationId } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const [messageText, setMessageText] = useState('');
    const flatListRef = useRef<FlatList>(null);
    const convOptionsRef = useRef<BottomSheetRef>(null);
    const orderDetailsRef = useRef<BottomSheetRef>(null);
    const [isOptionsVisible, setIsOptionsVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const socketService = useChatSocket();

    const { data: profile } = useGetProfileQuery();
    const { data: conversation, isLoading: isConvLoading } = useGetConversationQuery(conversationId);
    const {
        data,
        isLoading: isMessagesLoading,
    } = useGetMessagesQuery({ conversationId, limit: 30 });

    const [markAsRead] = useMarkConversationAsReadMutation();
    const typingUsers = useSelector((state: RootState) => state.chat.typingUsers[conversationId] || []);

    const messages = data?.items || [];
    const memoizedMessages = useMemo(() => [...messages].reverse(), [messages]);
    const isLoading = isMessagesLoading && messages.length === 0;
    const currentUserId = profile?.id;

    const participants = useMemo(() =>
        conversation?.participants?.filter(p => p.id !== profile?.id) || [],
        [conversation?.participants, profile?.id]
    );

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

    const handleLongPress = (message: ChatMessage, event: GestureResponderEvent) => {
        const { pageX, pageY } = event.nativeEvent;
        setMenuPosition({ x: pageX, y: pageY });
        setSelectedMessage(message);
        setIsOptionsVisible(true);
    };

    const handleCopy = async () => {
        if (selectedMessage?.content) {
            await Clipboard.setStringAsync(selectedMessage.content);
            toast.success('Message copied!');
        }
        setIsOptionsVisible(false);
        setSelectedMessage(null);
    };

    const handleHeaderOptions = () => {
        convOptionsRef.current?.expand();
    };

    const handleViewOrder = () => {
        orderDetailsRef.current?.expand();
    };

    if (isConvLoading && !conversation) {
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

                <Pressable onPress={handleHeaderOptions} style={styles.headerRightBtn}>
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <KeyboardAvoidingView
                behavior="padding"
                keyboardVerticalOffset={0}
                style={{ flex: 1 }}
            >
                {isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={memoizedMessages}
                        inverted={true}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        initialNumToRender={15}
                        windowSize={10}
                        maxToRenderPerBatch={10}
                        removeClippedSubviews={true}
                        renderItem={({ item }) => (
                            <MessageBubble
                                message={item}
                                isOwnMessage={item.sender.id === currentUserId}
                                onLongPress={handleLongPress}
                            />
                        )}
                        style={{ flex: 1 }}
                        contentContainerStyle={[styles.messageList, { paddingBottom: spacing.lg }]}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                    />
                )}

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
            </KeyboardAvoidingView>

            <OverKeyboardView visible={isOptionsVisible}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => setIsOptionsVisible(false)}
                >
                    <Animated.View
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(200)}
                        style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.2)' }]}
                    >
                        <Animated.View
                            entering={FadeIn.duration(200)}
                            style={[
                                styles.floatingMenu,
                                {
                                    backgroundColor: colors.surface,
                                    top: Math.min(Math.max(insets.top + 60, menuPosition.y - 120), screenHeight - 200),
                                    left: selectedMessage?.sender?.id === currentUserId
                                        ? Math.max(20, menuPosition.x - 190)
                                        : Math.min(screenWidth - 210, menuPosition.x + 10),
                                }
                            ]}
                        >
                            <Pressable
                                style={({ pressed }) => [
                                    styles.menuOption,
                                    { backgroundColor: pressed ? colors.surfaceRaised : 'transparent' }
                                ]}
                                onPress={handleCopy}
                            >
                                <Ionicons name="copy-outline" size={18} color={colors.textPrimary} />
                                <Typography variant="body">Copy Text</Typography>
                            </Pressable>

                            <View style={[styles.menuSeparator, { backgroundColor: colors.border }]} />

                            <Pressable
                                style={({ pressed }) => [
                                    styles.menuOption,
                                    { backgroundColor: pressed ? colors.surfaceRaised : 'transparent' }
                                ]}
                                onPress={() => setIsOptionsVisible(false)}
                            >
                                <Ionicons name="close-outline" size={18} color={colors.error} />
                                <Typography variant="body" color={colors.error}>Cancel</Typography>
                            </Pressable>
                        </Animated.View>
                    </Animated.View>
                </Pressable>
            </OverKeyboardView>

            <ConversationOptionsSheet
                ref={convOptionsRef}
                conversation={conversation || null}
                onViewOrder={handleViewOrder}
                onViewProfile={() => {
                    const otherParticipant = conversation?.participants?.find(p => p.id !== profile?.id);
                    // if (otherParticipant) {
                    //     router.push(`/profile/${otherParticipant.id}`);
                    // }
                }}
            />

            {/* <OrderDetailSheet
                ref={orderDetailsRef}
                order={conversation?.order || null}
                onChat={() => convOptionsRef.current?.close()}
            /> */}
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
    overlay: {
        flex: 1,
    },
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    floatingMenu: {
        position: 'absolute',
        width: 170,
        borderRadius: 16,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },
    menuSeparator: {
        height: 1,
        marginHorizontal: 12,
    },
});
