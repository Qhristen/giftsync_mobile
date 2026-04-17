import MessageBubble from '@/components/chat/MessageBubble';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useChatMutation } from '@/store/api/aiApi';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    TextInput,
    View
} from 'react-native';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
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
    const [isAITyping, setIsAITyping] = useState(false);

    const [chatMutation] = useChatMutation();

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
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        try {
            const result = await chatMutation({ message: currentText }).unwrap();

            if (result.response) {
                const responseMsg: AIMessage = {
                    id: (Date.now() + 1).toString(),
                    content: result.response.message,
                    isOwnMessage: false,
                    createdAt: new Date().toISOString(),
                    uiData: result.response.uiData,
                };
                setMessages(prev => [...prev, responseMsg]);
            }
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMsg: AIMessage = {
                id: (Date.now() + 1).toString(),
                content: "I'm having trouble connecting right now. Please try again later.",
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
                    borderBottomWidth: 1,
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
                    onPress={() => setMessages([messages[0]])}
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
                data={messages}
                showsVerticalScrollIndicator={false}
                renderScrollComponent={renderScrollComponent}
                keyExtractor={(item) => item.id}
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
                                />

                                {/* Recommendations Carousel */}
                                <View style={{ paddingLeft: spacing.xl, paddingRight: spacing.md, paddingBottom: spacing.md }}>
                                    <FlatList
                                        data={item.uiData?.items}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        keyExtractor={(rec: any) => rec.id}
                                        renderItem={({ item: rec }) => (
                                            <Card style={styles.recCard} onPress={() => router.push({ pathname: '/(tabs)/shop/[id]', params: { id: rec.id } })}>
                                                <Image source={{ uri: rec.imageUrls?.[0] }} style={styles.recImage} />
                                                <Typography variant="bodyBold" numberOfLines={1} style={{ marginTop: 8 }}>{rec.name}</Typography>
                                                <Typography variant="label" color={colors.primary}>{formatCurrency(rec.price, rec.currency || 'NGN')}</Typography>
                                            </Card>
                                        )}
                                    />
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
                                />

                                {/* Occasions Carousel */}
                                <View style={{ paddingLeft: spacing.xl, paddingRight: spacing.md, paddingBottom: spacing.md }}>
                                    <FlatList
                                        data={item.uiData?.items}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        keyExtractor={(rec: any) => rec.id}
                                        renderItem={({ item: rec }) => (
                                            <Card style={[styles.recCard, { padding: 12, width: 220, marginRight: 12 }]} onPress={() => router.push({ pathname: '/(tabs)/occasions/[id]', params: { id: rec.id } })}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Typography variant="bodyBold" numberOfLines={1}>{rec.title}</Typography>
                                                        <Typography variant="caption" color={colors.textSecondary}>{new Date(rec.date).toLocaleDateString()}</Typography>
                                                    </View>
                                                </View>
                                            </Card>
                                        )}
                                    />
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
                                />

                                {/* Contacts Carousel */}
                                <View style={{ paddingLeft: spacing.xl, paddingRight: spacing.md, paddingBottom: spacing.md }}>
                                    <FlatList
                                        data={item.uiData?.items}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        keyExtractor={(rec: any) => rec.id}
                                        renderItem={({ item: rec }) => (
                                            <Card style={[styles.recCard, { padding: 12, width: 220, marginRight: 12 }]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                                    {rec.avatar ? (
                                                        <Image source={{ uri: rec.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                                                    ) : (
                                                        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                                                            <Typography variant="bodyBold" color={colors.primary}>
                                                                {rec.name?.substring(0, 2).toUpperCase() || 'CX'}
                                                            </Typography>
                                                        </View>
                                                    )}
                                                    <View style={{ flex: 1 }}>
                                                        <Typography variant="bodyBold" numberOfLines={1}>{rec.name}</Typography>
                                                        {rec.phoneNumber && <Typography variant="caption" color={colors.textSecondary}>{rec.phoneNumber}</Typography>}
                                                    </View>
                                                </View>
                                            </Card>
                                        )}
                                    />
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
                        />
                    );
                }}
                style={{ flex: 1 }}
                contentContainerStyle={[styles.messageList, { paddingBottom: spacing.lg }]}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
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
    }
});
