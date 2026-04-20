import MessageBubble from '@/components/chat/MessageBubble';
import Avatar from '@/components/ui/Avatar';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { AiChatHistoryItem, useChatMutation } from '@/store/api/aiApi';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
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
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

interface AIMessage {
    id: string;
    content: string;
    isOwnMessage: boolean;
    createdAt: string;
    isTyping?: boolean;
    uiData?: {
        type: 'products' | 'occasions' | 'contacts' | 'none';
        items?: any[];
    };
}

export default function AIChatScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);
    const [isOptionsVisible, setIsOptionsVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedMessageIsOwn, setSelectedMessageIsOwn] = useState(false);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    const { user } = useAppSelector(s => s.auth);
    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<AIMessage[]>([
        {
            id: '1',
            content: `Hello ${user?.name}! I am GiftSync AI. I can help you find the perfect gift, suggest personalized ideas, or answer any questions about our shop. How can I help you today?`,
            isOwnMessage: false,
            createdAt: new Date().toISOString(),
        }
    ]);
    const [chatHistory, setChatHistory] = useState<AiChatHistoryItem[]>([]);
    const [isAITyping, setIsAITyping] = useState(false);
    const [selectedMessageText, setSelectedMessageText] = useState('');

    const [chatMutation] = useChatMutation();

    const handleMessageLongPress = (msg: any, event: GestureResponderEvent) => {
        const { pageX, pageY } = event.nativeEvent;
        setMenuPosition({ x: pageX, y: pageY });
        setSelectedMessageText(msg.content);
        setSelectedMessageIsOwn(msg.isOwnMessage);
        setIsOptionsVisible(true);
    };

    const handleCopy = async () => {
        if (selectedMessageText) {
            await Clipboard.setStringAsync(selectedMessageText);
            toast.success('Message copied!');
        }
        setIsOptionsVisible(false);
        setSelectedMessageText('');
    };

    const handleSend = async () => {
        if (!messageText.trim()) return;

        const currentText = messageText.trim();
        const userMsg: AIMessage = {
            id: Date.now().toString(),
            content: currentText,
            isOwnMessage: true,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
        setMessageText('');
        setIsAITyping(true);

        setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);

        try {
            const result = await chatMutation({
                message: currentText,
                history: chatHistory
            }).unwrap();

            if (result.response) {

                const responseMsg: AIMessage = {
                    id: (Date.now() + 1).toString(),
                    content: result.response.message,
                    isOwnMessage: false,
                    createdAt: new Date().toISOString(),
                    uiData: result.response.uiData,
                };
                setMessages(prev => [...prev, responseMsg]);

                // Update conversation history with user message and model response
                setChatHistory(prev => [
                    ...prev,
                    { role: 'user', content: currentText },
                    { role: 'model', content: result.response.message }
                ]);
            }
        } catch (error: any) {
            console.error('Chat Error:', error);
            const errorMsg: AIMessage = {
                id: (Date.now() + 1).toString(),
                content: error?.data?.message || "I'm having trouble connecting right now. Please try again later.",
                isOwnMessage: false,
                createdAt: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsAITyping(false);
        }
    };

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[
                styles.header,
                {
                    paddingTop: insets.top + 10,
                    paddingBottom: 16,
                    backgroundColor: colors.surface,
                    borderBottomColor: colors.border,
                    // borderBottomWidth: 1,
                }
            ]}>
                <View style={styles.headerLeft}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
                    </Pressable>

                    <View style={styles.aiBranding}>
                        <View style={[styles.aiAvatar, { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]}>
                            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                        </View>
                        <View>
                            <Typography variant="bodyBold" style={{ fontSize: 16 }}>GiftSync AI</Typography>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <View style={[styles.statusDot, { backgroundColor: isAITyping ? colors.primary : colors.success }]} />
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {isAITyping ? 'typing...' : 'Active now'}
                                </Typography>
                            </View>
                        </View>
                    </View>
                </View>

                <Pressable
                    onPress={() => {
                        setMessages([messages[0]]);
                        setChatHistory([]);
                    }}
                    style={({ pressed }) => [
                        styles.headerAction,
                        pressed && { opacity: 0.7 }
                    ]}
                >
                    <Ionicons name="refresh-outline" size={22} color={colors.textSecondary} />
                </Pressable>
            </View>

            {/* Chat Content wrap */}
            <KeyboardAvoidingView
                behavior="padding"
                keyboardVerticalOffset={0}
                style={{ flex: 1 }}
            >
                {/* Chat Area */}
                <FlatList
                    ref={flatListRef}
                    data={[...messages].reverse()}
                    inverted={true}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    keyboardDismissMode="on-drag"
                    maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                    ListHeaderComponent={isAITyping ? (
                        <View style={styles.typingIndicatorContainer}>
                            <View style={[styles.typingIndicatorBubble, { backgroundColor: colors.surfaceRaised }]}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Typography variant="body" color={colors.textSecondary} style={{ fontStyle: 'italic' }}>
                                    thinking...
                                </Typography>
                            </View>
                        </View>
                    ) : null}
                    renderItem={({ item }) => {
                        const hasProducts = item.uiData?.type === 'products' && item.uiData.items && item.uiData.items.length > 0;
                        const hasOccasions = item.uiData?.type === 'occasions' && item.uiData.items && item.uiData.items.length > 0;
                        const hasContacts = item.uiData?.type === 'contacts' && item.uiData.items && item.uiData.items.length > 0;

                        if (hasProducts) {
                            return (
                                <View>
                                    <MessageBubble
                                        message={{
                                            id: item.id,
                                            content: item.content,
                                            createdAt: item.createdAt,
                                            isOwnMessage: false,
                                        } as any}
                                        isOwnMessage={false}
                                        onLongPress={handleMessageLongPress}
                                    />
                                    <View style={{ paddingLeft: spacing.xl, paddingRight: spacing.md, paddingBottom: spacing.md }}>
                                        <View style={styles.twoColumnGrid}>
                                            {item.uiData?.items?.map((rec: any, index: number) => (
                                                <Animated.View
                                                    key={rec.id}
                                                    entering={FadeInDown.delay(index * 60).duration(300).springify().damping(50)}
                                                    style={{ width: '48%', marginBottom: 12 }}
                                                >
                                                    <Pressable
                                                        onPress={() => router.push({ pathname: '/(tabs)/shop/[id]', params: { id: rec.id } })}
                                                        style={({ pressed }) => [
                                                            styles.gridCardInner,
                                                            { backgroundColor: colors.surfaceRaised },
                                                            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                                                        ]}
                                                    >
                                                        <Image source={{ uri: rec.imageUrls?.[0] }} style={styles.gridProductImage} />
                                                        <View style={styles.gridCardContent}>
                                                            <Typography variant="bodyBold" numberOfLines={1} style={{ textAlign: 'center', fontSize: 13, marginTop: 4 }}>{rec.name}</Typography>
                                                            <Typography variant="label" color={colors.primary} style={{ textAlign: 'center', fontSize: 12 }}>{formatCurrency(rec.price, rec.currency || 'NGN')}</Typography>
                                                        </View>
                                                    </Pressable>
                                                </Animated.View>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            );
                        }

                        if (hasOccasions) {
                            return (
                                <View>
                                    <MessageBubble
                                        message={{
                                            id: item.id,
                                            content: item.content,
                                            createdAt: item.createdAt,
                                            isOwnMessage: false,
                                        } as any}
                                        isOwnMessage={false}
                                        onLongPress={handleMessageLongPress}
                                    />
                                    <View style={{ paddingLeft: spacing.xl, paddingRight: spacing.md, paddingBottom: spacing.md }}>
                                        <View style={styles.twoColumnGrid}>
                                            {item.uiData?.items?.map((rec: any, index: number) => (
                                                <Animated.View
                                                    key={rec.id}
                                                    entering={FadeInDown.delay(index * 60).duration(300).springify().damping(50)}
                                                    style={{ width: '48%', marginBottom: 12 }}
                                                >
                                                    <Pressable
                                                        onPress={() => router.push({ pathname: '/(tabs)/occasions/[id]', params: { id: rec.id } })}
                                                        style={({ pressed }) => [
                                                            styles.gridCardInner,
                                                            { backgroundColor: colors.surfaceRaised },
                                                            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                                                        ]}
                                                    >
                                                        {rec.contact ? (
                                                            <Avatar uri={rec.contact?.avatar} name={rec.contact?.name} size="md" />
                                                        ) : (
                                                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                                                                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                                            </View>
                                                        )}
                                                        <View style={styles.gridCardContent}>
                                                            {rec.contact?.name && (
                                                                <Typography variant="bodyBold" numberOfLines={1} style={{ textAlign: 'center', fontSize: 13 }}>
                                                                    {rec.contact.name.split(' ')[0]}
                                                                </Typography>
                                                            )}
                                                            <Typography variant="caption" color={rec.contact ? colors.textSecondary : colors.textPrimary} numberOfLines={1} style={{ textAlign: 'center', fontSize: 10 }}>
                                                                {rec.title}
                                                            </Typography>
                                                            <Typography variant="caption" color={colors.primary} style={{ textAlign: 'center', fontSize: 10, marginTop: 2 }}>
                                                                {new Date(rec.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </Typography>
                                                        </View>
                                                    </Pressable>
                                                </Animated.View>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            );
                        }

                        if (hasContacts) {
                            return (
                                <View>
                                    <MessageBubble
                                        message={{
                                            id: item.id,
                                            content: item.content,
                                            createdAt: item.createdAt,
                                            conversationId: '',
                                            senderId: '',
                                        } as any}
                                        isOwnMessage={false}
                                        onLongPress={handleMessageLongPress}
                                    />
                                    <View style={{ paddingLeft: spacing.xl, paddingRight: spacing.md, paddingBottom: spacing.md }}>
                                        <View style={styles.twoColumnGrid}>
                                            {item.uiData?.items?.map((rec: any, index: number) => (
                                                <Animated.View
                                                    key={rec.id}
                                                    entering={FadeInDown.delay(index * 60).duration(300).springify().damping(50)}
                                                    style={{ width: '48%', marginBottom: 12 }}
                                                >
                                                    <Pressable
                                                        style={({ pressed }) => [
                                                            styles.gridCardInner,
                                                            { backgroundColor: colors.surfaceRaised },
                                                            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                                                        ]}
                                                    >
                                                        <Avatar uri={rec.avatar} name={rec.name} size="md" />
                                                        <View style={styles.gridCardContent}>
                                                            <Typography variant="bodyBold" numberOfLines={1} style={{ textAlign: 'center', fontSize: 13 }}>{rec.name}</Typography>
                                                            {rec.relationship && (
                                                                <Typography variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ textAlign: 'center', fontSize: 10 }}>
                                                                    {rec.relationship}
                                                                </Typography>
                                                            )}
                                                            {rec.phoneNumber && (
                                                                <Typography variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ textAlign: 'center', fontSize: 10, marginTop: 2 }}>
                                                                    {rec.phoneNumber}
                                                                </Typography>
                                                            )}
                                                        </View>
                                                    </Pressable>
                                                </Animated.View>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            );
                        }

                        return (
                            <MessageBubble
                                message={{
                                    id: item.id,
                                    content: item.content,
                                    createdAt: item.createdAt,
                                    isOwnMessage: item.isOwnMessage,
                                } as any}
                                isOwnMessage={item.isOwnMessage}
                                onLongPress={handleMessageLongPress}
                            />
                        );
                    }}
                    style={{ flex: 1 }}
                    contentContainerStyle={[styles.messageList, { paddingBottom: spacing.lg }]}
                    keyboardShouldPersistTaps="handled"
                />

                {/* Input */}
                <View style={[
                    styles.inputContainer,
                    {
                        borderTopColor: colors.border,
                        backgroundColor: colors.surface,
                        paddingBottom: insets.bottom + 12,
                    }
                ]}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            placeholder="Ask me anything..."
                            value={messageText}
                            onChangeText={setMessageText}
                            onSubmitEditing={handleSend}
                            placeholderTextColor={colors.textPrimary + '20'}
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
                                    left: selectedMessageIsOwn
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
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    aiBranding: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    headerAction: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    aiAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageList: {
        paddingVertical: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    inputWrapper: {
        flex: 1,
        marginRight: 8,
    },
    input: {
        height: 48,
        borderRadius: 24,
        paddingHorizontal: 20,
        fontSize: 16,
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Two-column grid layout
    twoColumnGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridCardInner: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        gap: 8,
    },
    gridCardContent: {
        width: '100%',
        alignItems: 'center',
    },
    gridProductImage: {
        width: '100%',
        height: 110,
        borderRadius: 8,
    },
    // Legacy styles kept for safety
    recCard: {
        width: 160,
        padding: 8,
        marginRight: 12,
        borderRadius: 16,
    },
    recImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
    },
    typingIndicatorContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
        alignItems: 'flex-start',
        marginTop: 8,
    },
    typingIndicatorBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        gap: 8,
    },
    overlay: {
        flex: 1,
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
    menuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 12,
    },
    menuSeparator: {
        height: 1,
        marginHorizontal: 12,
    },
});