import MessageBubble from '@/components/chat/MessageBubble';
import MessageOptionsSheet from '@/components/sheets/MessageOptionsSheet';
import Avatar from '@/components/ui/Avatar';
import { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { AiChatHistoryItem, useChatMutation } from '@/store/api/aiApi';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    TextInput,
    View
} from 'react-native';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    const messageOptionsSheetRef = useRef<BottomSheetRef>(null);

    const renderScrollComponent = React.useCallback((props: any) => (
        <KeyboardChatScrollView
            {...props}
            keyboardLiftBehavior="whenAtEnd"
            automaticallyAdjustContentInsets={false}
            contentInsetAdjustmentBehavior="never"
        />
    ), []);

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

    const handleMessageLongPress = (msg: any) => {
        setSelectedMessageText(msg.content);
        messageOptionsSheetRef.current?.expand();
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

            {/* Chat Area */}
            <FlatList
                ref={flatListRef}
                data={[...messages].reverse()}
                inverted={true}
                showsVerticalScrollIndicator={false}
                renderScrollComponent={renderScrollComponent}
                keyExtractor={(item) => item.id}
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
                                {/* AI Text Context */}
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

                                {/* Recommendations Two-Column Grid */}
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
                                {/* AI Text Context */}
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

                                {/* Occasions Two-Column Grid */}
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
                                {/* AI Text Context */}
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

                                {/* Contacts Two-Column Grid */}
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
                                conversationId: '',
                                senderId: '',
                            } as any}
                            isOwnMessage={item.isOwnMessage}
                            onLongPress={handleMessageLongPress}
                        />
                    );
                }}
                style={{ flex: 1 }}
                contentContainerStyle={[styles.messageList, { paddingBottom: spacing.lg }]}
            />

            {/* Input */}
            <KeyboardStickyView offset={{ opened: insets.bottom }}>
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
            </KeyboardStickyView>

            <MessageOptionsSheet
                ref={messageOptionsSheetRef}
                textToCopy={selectedMessageText}
                onClose={() => setSelectedMessageText('')}
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
    }
});