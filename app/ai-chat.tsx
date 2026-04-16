import MessageBubble from '@/components/chat/MessageBubble';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetRecommendationsV2Query } from '@/store/api/productApi';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Pressable,
    StyleSheet,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AIMessage {
    id: string;
    content: string;
    isOwnMessage: boolean;
    createdAt: string;
    isTyping?: boolean;
    isRecommendation?: boolean;
}

export default function AIChatScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);

    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<AIMessage[]>([
        {
            id: '1',
            content: 'Hello! I am GiftSync AI. I can help you find the perfect gift, suggest personalized ideas, or answer any questions about our shop. How can I help you today?',
            isOwnMessage: false,
            createdAt: new Date().toISOString(),
        }
    ]);
    const [isAITyping, setIsAITyping] = useState(false);

    // Just fetch some general recommendations to mock AI suggesting things
    const { data: recs = [], isFetching } = useGetRecommendationsV2Query({ limit: 4 });

    const handleSend = () => {
        if (!messageText.trim()) return;

        const userMsg: AIMessage = {
            id: Date.now().toString(),
            content: messageText.trim(),
            isOwnMessage: true,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
        const currentText = messageText.trim().toLowerCase();
        setMessageText('');
        setIsAITyping(true);

        // Simple mock AI logic
        setTimeout(() => {
            setIsAITyping(false);

            if (currentText.includes('gift') || currentText.includes('recommend') || currentText.includes('idea')) {
                const responseMsg: AIMessage = {
                    id: (Date.now() + 1).toString(),
                    content: "Here are some of my top recommendations based on trending items!",
                    isOwnMessage: false,
                    createdAt: new Date().toISOString(),
                    isRecommendation: true,
                };
                setMessages(prev => [...prev, responseMsg]);
            } else {
                const responseMsg: AIMessage = {
                    id: (Date.now() + 1).toString(),
                    content: "That sounds interesting! Please provide more details or ask me about gift recommendations for a specific occasion like birthdays or weddings.",
                    isOwnMessage: false,
                    createdAt: new Date().toISOString(),
                };
                setMessages(prev => [...prev, responseMsg]);
            }
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            behavior={"padding"}
            style={[styles.container, { backgroundColor: colors.background }]}
            keyboardVerticalOffset={0}
        >
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={[
                styles.header,
                {
                    paddingTop: insets.top,
                    backgroundColor: colors.surface,
                    borderBottomColor: colors.border,
                }
            ]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
                </Pressable>

                <View style={styles.headerTitle}>
                    <View style={[styles.aiAvatar, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="sparkles" size={20} color={colors.primary} />
                    </View>
                    <View>
                        <Typography variant="bodyBold">GiftSync AI</Typography>
                        {isAITyping ? (
                            <Typography variant="caption" color={colors.primary}>typing...</Typography>
                        ) : (
                            <Typography variant="caption" color={colors.success}>Online</Typography>
                        )}
                    </View>
                </View>
                <View style={{ width: 44 }} />
            </View>

            {/* Chat Area */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    if (item.isRecommendation && recs && recs.length > 0) {
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

                                {/* Recommendations Carousel mock */}
                                <View style={{ paddingLeft: spacing.xl, paddingRight: spacing.md, paddingBottom: spacing.md }}>
                                    <FlatList
                                        data={recs}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        keyExtractor={(rec) => rec.id}
                                        renderItem={({ item: rec }) => (
                                            <Card style={styles.recCard} onPress={() => router.push({ pathname: '/(tabs)/shop/[id]', params: { id: rec.id } })}>
                                                <Image source={{ uri: rec.imageUrls?.[0] }} style={styles.recImage} />
                                                <Typography variant="bodyBold" numberOfLines={1} style={{ marginTop: 8 }}>{rec.name}</Typography>
                                                <Typography variant="label" color={colors.primary}>{formatCurrency(rec.price, rec.currency)}</Typography>
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
        justifyContent: 'center',
        gap: 10,
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
