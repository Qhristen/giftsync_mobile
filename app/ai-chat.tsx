import ConfirmActionCard from '@/components/chat/ConfirmActionCard';
import MessageBubble from '@/components/chat/MessageBubble';
import ScrollToBottomButton from '@/components/chat/ScrollToBottomButton';
import Avatar from '@/components/ui/Avatar';
import Typography from '@/components/ui/Typography';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';
import { useTheme } from '@/hooks/useTheme';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import {
    AiChatHistoryItem,
    AiProductSuggestion,
    AiUiData,
    normalizeAiChatResponse,
    useChatMutation,
} from '@/store/api/aiApi';
import { walletApi } from '@/store/api/walletApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { adjustCoinBalance } from '@/store/slices/authSlice';
import { formatCurrency } from '@/utils/formatCurrency';
import { moderateScale } from '@/utils/scaling';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01Icon,
    Calendar01Icon,
    Cancel01Icon,
    Copy01Icon,
    Delete02Icon,
    SentIcon,
    SparklesIcon
} from '@hugeicons/core-free-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    GestureResponderEvent,
    Pressable,
    StyleSheet,
    TextInput,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    useWindowDimensions,
    View
} from 'react-native';
import { KeyboardAvoidingView, OverKeyboardView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

interface AIMessage {
    id: string;
    content: string;
    isOwnMessage: boolean;
    createdAt: string;
    isTyping?: boolean;
    uiData?: AiUiData;
}

const AI_CHAT_CACHE_KEY = 'ai_chat_history_v1';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default function AIChatScreen() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { initialMessage } = useLocalSearchParams<{ initialMessage?: string }>();
    const initialMessageProcessed = useRef(false);
    const { colors, spacing } = useTheme();
    const { aiChatCost } = usePlatformConfig();
    const { enabled: aiEnabled } = useFeatureFlag('ai_assistant');
    const { enabled: giftRequestsEnabled } = useFeatureFlag('gift_requests');
    const insets = useSafeAreaInsets();
    const flatListRef = useRef<FlatList>(null);
    const inputRef = useRef<TextInput>(null);
    const [isOptionsVisible, setIsOptionsVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedMessageIsOwn, setSelectedMessageIsOwn] = useState(false);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();

    const { user } = useAppSelector(s => s.auth);
    const cacheKey = user?.id ? `${AI_CHAT_CACHE_KEY}_${user.id}` : null;

    const [messageText, setMessageText] = useState('');
    const [messages, setMessages] = useState<AIMessage[]>([
        {
            id: '1',
            content: `Hello! I'm your personal AI gift assistant. I can help you find the perfect gift, suggest personalized ideas, or answer any questions about our shop. How can I help you today?`,
            isOwnMessage: false,
            createdAt: new Date().toISOString(),
        }
    ]);
    const [chatHistory, setChatHistory] = useState<AiChatHistoryItem[]>([]);
    const [isCacheLoaded, setIsCacheLoaded] = useState(false);
    const [isAITyping, setIsAITyping] = useState(false);
    const [selectedMessageText, setSelectedMessageText] = useState('');
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);

    const [chatMutation] = useChatMutation();

    // Load cache on mount or when user changes
    useEffect(() => {
        if (!cacheKey) {
            setIsCacheLoaded(true);
            return;
        }

        const loadCache = async () => {
            try {
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached) {
                    const { messages: cachedMsgs, chatHistory: cachedHistory, timestamp } = JSON.parse(cached);
                    const now = Date.now();

                    if (now - timestamp < CACHE_TTL) {
                        const normalizedMessages = Array.isArray(cachedMsgs)
                            ? cachedMsgs.map((message: AIMessage) => {
                                if (message.isOwnMessage) return message;

                                const normalized = normalizeAiChatResponse({
                                    response: {
                                        message: message.content,
                                        uiData: message.uiData,
                                    },
                                }).response;

                                return {
                                    ...message,
                                    content: normalized.message,
                                    uiData: normalized.uiData,
                                };
                            })
                            : [];
                        const normalizedHistory = Array.isArray(cachedHistory)
                            ? cachedHistory.map((historyItem: AiChatHistoryItem) => {
                                if (historyItem.role !== 'model') return historyItem;

                                return {
                                    ...historyItem,
                                    content: JSON.stringify(normalizeAiChatResponse(historyItem.content).response),
                                };
                            })
                            : [];

                        setMessages(normalizedMessages);
                        setChatHistory(normalizedHistory);
                    } else {
                        // Cache expired
                        await AsyncStorage.removeItem(cacheKey);
                    }
                }
            } catch (e) {
                console.error('Failed to load chat cache:', e);
            } finally {
                setIsCacheLoaded(true);
            }
        };
        loadCache();
    }, [cacheKey]);

    // Save cache whenever messages or history change
    useEffect(() => {
        if (!isCacheLoaded || !cacheKey) return;

        const saveCache = async () => {
            try {
                const cacheData = {
                    messages,
                    chatHistory,
                    timestamp: Date.now(),
                };
                await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
            } catch (e) {
                console.error('Failed to save chat cache:', e);
            }
        };

        saveCache();
    }, [messages, chatHistory, isCacheLoaded, cacheKey]);

    useEffect(() => {
        if (isCacheLoaded && initialMessage && !initialMessageProcessed.current) {
            initialMessageProcessed.current = true;
            handleSend(initialMessage);
        }
    // handleSend is declared below and this effect must only react to cache hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCacheLoaded, initialMessage]);

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

    const handleMessageScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const shouldShow = event.nativeEvent.contentOffset.y > 120;
        setShowScrollToBottom((current) => current === shouldShow ? current : shouldShow);
    }, []);

    const scrollToLatest = useCallback((animated = false) => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated });
        setShowScrollToBottom(false);
    }, []);

    const scrollToBottom = useCallback(() => scrollToLatest(true), [scrollToLatest]);

    useFocusEffect(useCallback(() => {
        if (!isCacheLoaded) return;

        const frame = requestAnimationFrame(() => scrollToLatest(false));
        return () => cancelAnimationFrame(frame);
    }, [isCacheLoaded, scrollToLatest]));

    useEffect(() => {
        if (!isCacheLoaded) return;

        const frame = requestAnimationFrame(() => scrollToLatest(false));
        return () => cancelAnimationFrame(frame);
    }, [isCacheLoaded, messages.length, scrollToLatest]);

    const handleSend = async (customMessage?: string | any) => {
        if (isAITyping) return;
        const textToSend = typeof customMessage === 'string' ? customMessage : messageText;
        if (!textToSend.trim()) return;

        // Check wallet balance
        const coinBalance = user?.coinBalance || 0;
        if (coinBalance < aiChatCost) {
            toast.error("Insufficient Balance", {
                description: `Each message costs ${aiChatCost} coins. Please top up your wallet.`,
                action: {
                    label: 'Top Up',
                    onClick: () => router.push('/wallet')
                }
            });
            return;
        }

        const currentText = textToSend.trim();
        const userMsg: AIMessage = {
            id: Date.now().toString(),
            content: currentText,
            isOwnMessage: true,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMsg]);
        dispatch(adjustCoinBalance(-aiChatCost));
        dispatch(
            walletApi.util.updateQueryData('getWalletBalance', undefined, (draft) => {
                draft.balance = Math.max(0, draft.balance - aiChatCost);
            }),
        );
        if (typeof customMessage !== 'string') {
            setMessageText('');
        }
        setIsAITyping(true);

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
                    { role: 'model', content: JSON.stringify(result.response) }
                ]);

            }
        } catch (error: any) {
            console.error('Chat Error:', error);
            dispatch(adjustCoinBalance(aiChatCost));
            dispatch(walletApi.util.updateQueryData('getWalletBalance', undefined, (draft) => {
                draft.balance += aiChatCost;
            }));
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

    if (!aiEnabled) {
        return (
            <View style={[styles.unavailable, { backgroundColor: colors.background, paddingHorizontal: spacing.xl }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={[styles.unavailableIcon, { backgroundColor: colors.lavender, borderColor: colors.ink }]}>
                    <HugeiconsIcon icon={SparklesIcon} size={30} color={colors.ink} />
                </View>
                <Typography variant="h2" align="center">Gift concierge is unavailable</Typography>
                <Typography variant="body" color={colors.textSecondary} align="center">Please check back shortly.</Typography>
                <Pressable onPress={() => router.back()} style={[styles.unavailableButton, { backgroundColor: colors.ink }]}>
                    <Typography variant="bodyBold" color={colors.surface}>Go back</Typography>
                </Pressable>
            </View>
        );
    }

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
                    paddingBottom: 12,
                }
            ]}>
                <View style={[styles.conciergeHeader, { backgroundColor: colors.lavender, borderColor: colors.ink }]}>
                    <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={21} color={colors.ink} />
                    </Pressable>

                    <View style={styles.aiBranding}>
                        <View style={[styles.aiAvatar, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={SparklesIcon} size={18} color={colors.ink} />
                        </View>
                        <View>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>GIFT CONCIERGE</Typography>
                            <Typography variant="bodyBold" style={{ fontSize: moderateScale(16) }}>The idea workbench</Typography>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <View style={[styles.statusDot, { backgroundColor: isAITyping ? colors.peach : colors.success, borderColor: colors.ink }]} />
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {isAITyping ? 'Sketching an idea…' : `${aiChatCost} coins per note`}
                                </Typography>
                            </View>
                        </View>
                    </View>

                    <Pressable
                        accessibilityLabel="Clear chat"
                        onPress={async () => {
                        // Reset to first message
                            const resetMessages = [messages.find(m => m.id === '1') || messages[0]];
                            setMessages(resetMessages);
                            setChatHistory([]);
                            setShowScrollToBottom(false);
                            if (cacheKey) {
                                try {
                                    await AsyncStorage.removeItem(cacheKey);
                                } catch (e) {
                                    console.error('Failed to clear cache:', e);
                                }
                            }
                        }}
                        style={({ pressed }) => [styles.headerAction, { backgroundColor: colors.surface, borderColor: colors.ink, opacity: pressed ? 0.65 : 1 }]}
                    >
                        <HugeiconsIcon icon={Delete02Icon} size={17} color={colors.ink} />
                    </Pressable>
                    <View style={[styles.headerTape, { backgroundColor: colors.lemon, borderColor: colors.ink }]} />
                </View>
            </View>

            {/* Chat Content wrap */}
            <KeyboardAvoidingView
                behavior="padding"
                keyboardVerticalOffset={0}
                style={{ flex: 1 }}
            >
                {/* Chat Area */}
                <View style={styles.messageArea}>
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
                            <View style={[styles.typingIndicatorBubble, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Typography variant="body" color={colors.textSecondary} style={{ fontStyle: 'italic' }}>
                                    thinking...
                                </Typography>
                            </View>
                        </View>
                    ) : null}
                    renderItem={({ item }) => {
                        const hasProducts = item.uiData?.type === 'products'
                            && (!!item.uiData.items?.length || !!item.uiData.suggestions?.length);
                        const hasEvents = item.uiData?.type === 'occasions' && item.uiData.items && item.uiData.items.length > 0;
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
                                        renderMarkdown
                                        onLongPress={handleMessageLongPress}
                                    />
                                    <View style={{ paddingLeft: spacing.xl, paddingRight: spacing.md, paddingBottom: spacing.md }}>
                                        <View style={styles.twoColumnGrid}>
                                            {item.uiData?.items?.map((rec: any, index: number) => (
                                                <View
                                                    key={rec.id}

                                                    style={{ width: '48%', marginBottom: 12 }}
                                                >
                                                    <Pressable
                                                        onPress={() => router.push({ pathname: '/product-detail', params: { id: rec.id } })}
                                                        style={({ pressed }) => [
                                                            styles.gridCardInner,
                                                            { backgroundColor: [colors.lemon, colors.mint, colors.peach, colors.lavender][index % 4], borderColor: colors.ink },
                                                            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                                                        ]}
                                                    >
                                                        {rec.imageUrls?.[0] ? (
                                                            <Image source={{ uri: rec.imageUrls[0] }} style={styles.gridProductImage} />
                                                        ) : (
                                                            <View style={[styles.gridProductImage, styles.productPlaceholder, { backgroundColor: colors.surface }]}>
                                                                <HugeiconsIcon icon={SparklesIcon} size={24} color={colors.primary} />
                                                            </View>
                                                        )}
                                                        <View style={styles.gridCardContent}>
                                                            <Typography variant="bodyBold" numberOfLines={1} style={{ textAlign: 'center', fontSize: moderateScale(13), marginTop: 4 }}>{rec.name}</Typography>
                                                            {rec.price != null && <Typography variant="label" color={colors.primary} style={{ textAlign: 'center', fontSize: moderateScale(12) }}>{formatCurrency(Number(rec.price), rec.currency || 'NGN')}</Typography>}
                                                        </View>
                                                    </Pressable>
                                                </View>
                                            ))}
                                        </View>
                                        {!!item.uiData?.suggestions?.length && (
                                            <View style={styles.suggestionList}>
                                                {item.uiData.suggestions.map((suggestion: AiProductSuggestion, index: number) => (
                                                    <View
                                                        key={`${suggestion.name}-${index}`}

                                                        style={[styles.suggestionCard, { backgroundColor: colors.surface, borderColor: colors.ink }]}
                                                    >
                                                        <View style={styles.suggestionHeading}>
                                                            <Typography variant="bodyBold" style={{ flex: 1 }}>{suggestion.name}</Typography>
                                                            <View style={[styles.offPlatformBadge, { backgroundColor: colors.peach, borderColor: colors.ink }]}>
                                                                <Typography variant="caption">SOURCE IT</Typography>
                                                            </View>
                                                        </View>
                                                        <Typography variant="body" color={colors.textSecondary}>{suggestion.whyItFits}</Typography>
                                                        {!!suggestion.estimatedBudget && (
                                                            <Typography variant="caption" color={colors.primary}>{suggestion.estimatedBudget}</Typography>
                                                        )}
                                                        {suggestion.canRequest && giftRequestsEnabled && (
                                                            <Pressable
                                                                onPress={() => handleSend(`Create a sourcing request for "${suggestion.name}".`)}
                                                                disabled={isAITyping}
                                                                style={[styles.requestSuggestionButton, { backgroundColor: colors.mint, borderColor: colors.ink }]}
                                                            >
                                                                <Typography variant="label">Create a sourcing request</Typography>
                                                                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color={colors.ink} style={{ transform: [{ rotate: '180deg' }] }} />
                                                            </Pressable>
                                                        )}
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            );
                        }

                        if (hasEvents) {
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
                                        renderMarkdown
                                        onLongPress={handleMessageLongPress}
                                    />
                                    <View style={{ paddingLeft: spacing.xl, paddingRight: spacing.md, paddingBottom: spacing.md }}>
                                        <View style={styles.twoColumnGrid}>
                                            {item.uiData?.items?.map((rec: any, index: number) => (
                                                <View
                                                    key={rec.id}

                                                    style={{ width: '48%', marginBottom: 12 }}
                                                >
                                                    <Pressable
                                                        onPress={() => router.push({ pathname: '/event-detail', params: { id: rec.id } })}
                                                        style={({ pressed }) => [
                                                            styles.gridCardInner,
                                                            { backgroundColor: [colors.lemon, colors.mint, colors.peach, colors.lavender][index % 4], borderColor: colors.ink },
                                                            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                                                        ]}
                                                    >
                                                        {rec.contact ? (
                                                            <Avatar uri={rec.contact?.avatar} name={rec.contact?.name} size="md" />
                                                        ) : (
                                                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '20', justifyContent: 'center', alignItems: 'center' }}>
                                                                <HugeiconsIcon icon={Calendar01Icon} size={20} color={colors.primary} />
                                                            </View>
                                                        )}
                                                        <View style={styles.gridCardContent}>
                                                            {rec.contact?.name && (
                                                                <Typography variant="bodyBold" numberOfLines={1} style={{ textAlign: 'center', fontSize: moderateScale(13) }}>
                                                                    {rec.contact.name.split(' ')[0]}
                                                                </Typography>
                                                            )}
                                                            <Typography variant="caption" color={rec.contact ? colors.textSecondary : colors.textPrimary} numberOfLines={1} style={{ textAlign: 'center', fontSize: moderateScale(10) }}>
                                                                {rec.title}
                                                            </Typography>
                                                            <Typography variant="caption" color={colors.primary} style={{ textAlign: 'center', fontSize: moderateScale(10), marginTop: 2 }}>
                                                                {new Date(rec.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                            </Typography>
                                                        </View>
                                                    </Pressable>
                                                </View>
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
                                        renderMarkdown
                                        onLongPress={handleMessageLongPress}
                                    />
                                    <View style={{ paddingLeft: spacing.xl, paddingRight: spacing.md, paddingBottom: spacing.md }}>
                                        <View style={styles.twoColumnGrid}>
                                            {item.uiData?.items?.map((rec: any, index: number) => (
                                                <View
                                                    key={rec.id}

                                                    style={{ width: '48%', marginBottom: 12 }}
                                                >
                                                    <Pressable
                                                        style={({ pressed }) => [
                                                            styles.gridCardInner,
                                                            { backgroundColor: [colors.lemon, colors.mint, colors.peach, colors.lavender][index % 4], borderColor: colors.ink },
                                                            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
                                                        ]}
                                                    >
                                                        <Avatar uri={rec.avatar} name={rec.name} size="md" />
                                                        <View style={styles.gridCardContent}>
                                                            <Typography variant="bodyBold" numberOfLines={1} style={{ textAlign: 'center', fontSize: moderateScale(13) }}>{rec.name}</Typography>
                                                            {rec.relationship && (
                                                                <Typography variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ textAlign: 'center', fontSize: moderateScale(10) }}>
                                                                    {rec.relationship}
                                                                </Typography>
                                                            )}
                                                            {rec.phoneNumber && (
                                                                <Typography variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ textAlign: 'center', fontSize: moderateScale(10), marginTop: 2 }}>
                                                                    {rec.phoneNumber}
                                                                </Typography>
                                                            )}
                                                        </View>
                                                    </Pressable>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>
                            );
                        }

                        if (item.uiData?.type === 'confirm_action') {
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
                                        renderMarkdown
                                        onLongPress={handleMessageLongPress}
                                    />
                                    <ConfirmActionCard
                                        actionType={item.uiData.actionType as any}
                                        details={item.uiData.details as any}
                                        currency={user?.currency}
                                        onConfirm={() => handleSend(
                                            item.uiData?.actionType === 'create_gift_request'
                                                ? 'Confirm and create the gift request'
                                                : item.uiData?.actionType === 'purchase_product'
                                                    ? 'Yes, place the order'
                                                    : 'Yes, send it'
                                        )}
                                        onEdit={() => {
                                            inputRef.current?.focus();
                                            toast.info('You can type your changes in the message box below.');
                                        }}
                                        onCancel={() => handleSend('Cancel')}
                                    />
                                </View>
                            );
                        }

                        if (item.uiData?.type === 'gift_request') {
                            // Current responses put a successfully persisted request in
                            // giftRequest. item.data supports older cached responses. Do not
                            // fall back to details because that is only the confirmation draft.
                            const request = item.uiData.giftRequest || item.uiData.item?.data;
                            const requestId = typeof request?.id === 'string' ? request.id.trim() : '';
                            const total = item.uiData.order?.total ?? request?.order?.total;
                            const requestCurrency = item.uiData.order?.currency || request?.currency || user?.currency || 'NGN';

                            if (!requestId) {
                                return (
                                    <MessageBubble
                                        message={{ id: item.id, content: item.content, createdAt: item.createdAt, isOwnMessage: false } as any}
                                        isOwnMessage={false}
                                        renderMarkdown
                                        onLongPress={handleMessageLongPress}
                                    />
                                );
                            }

                            return (
                                <View>
                                    <MessageBubble
                                        message={{ id: item.id, content: item.content, createdAt: item.createdAt, isOwnMessage: false } as any}
                                        isOwnMessage={false}
                                        renderMarkdown
                                        onLongPress={handleMessageLongPress}
                                    />
                                    <View style={[styles.createdRequestCard, { backgroundColor: colors.mint, borderColor: colors.ink, marginLeft: spacing.xl, marginRight: spacing.md }]}>
                                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>REQUEST CREATED</Typography>
                                        <Typography variant="h3">Your sourcing brief is in</Typography>
                                        <Typography variant="body" color={colors.textSecondary}>Pending review.</Typography>
                                        {total != null && <Typography variant="bodyBold" color={colors.primary}>{formatCurrency(Number(total), requestCurrency)}</Typography>}
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="View gift request"
                                            onPress={() => router.push(`/gift-requests/${requestId}` as unknown as Href)}
                                            style={[styles.payRequestButton, { backgroundColor: colors.accent, borderColor: colors.ink }]}
                                        >
                                            <Typography variant="label" color="#17151D">View request</Typography>
                                        </Pressable>
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
                                renderMarkdown={!item.isOwnMessage}
                                onLongPress={handleMessageLongPress}
                            />
                        );
                    }}
                    style={{ flex: 1 }}
                    contentContainerStyle={[styles.messageList, { paddingBottom: spacing.lg }]}
                    keyboardShouldPersistTaps="handled"
                    onScroll={handleMessageScroll}
                    scrollEventThrottle={16}
                    />
                    <ScrollToBottomButton visible={showScrollToBottom} onPress={scrollToBottom} />
                </View>

                {/* Input */}
                <View style={[
                    styles.inputContainer,
                    {
                        backgroundColor: colors.background,
                        paddingBottom: insets.bottom + 12,
                    }
                ]}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            ref={inputRef}
                            placeholder={`Ask me anything... (${aiChatCost} coins)`}
                            value={messageText}
                            onChangeText={setMessageText}
                            onSubmitEditing={handleSend}
                            editable={!isAITyping}
                            placeholderTextColor={colors.textPrimary + '20'}
                            style={[
                                styles.input,
                                {
                                    color: colors.textPrimary,
                                    backgroundColor: colors.surface,
                                    borderColor: colors.ink,
                                }
                            ]}
                        />
                        {/* <Typography variant="caption" color={colors.textSecondary} style={{ marginLeft: 16, marginTop: 4 }}>
                            Each message costs <Typography variant="caption" color={colors.primary} style={{ fontWeight: 'bold' }}>{aiChatCost} coins</Typography>
                        </Typography> */}
                    </View>
                    <Pressable
                        onPress={handleSend}
                        disabled={!messageText.trim() || isAITyping}
                        style={[
                            styles.sendBtn,
                            {
                                backgroundColor: messageText.trim() ? colors.lime : colors.surface,
                                borderColor: colors.ink,
                            }
                        ]}
                    >
                        <HugeiconsIcon
                            icon={SentIcon}
                            size={20}
                            color={messageText.trim() ? colors.ink : colors.textMuted}
                        />
                    </Pressable>
                </View>
            </KeyboardAvoidingView>

            <OverKeyboardView visible={isOptionsVisible}>
                <Pressable
                    style={StyleSheet.absoluteFill}
                    onPress={() => setIsOptionsVisible(false)}
                >
                    <View

                        style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.2)' }]}
                    >
                        <View

                            style={[
                                styles.floatingMenu,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.ink,
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
                                <HugeiconsIcon icon={Copy01Icon} size={18} color={colors.textPrimary} />
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
                                <HugeiconsIcon icon={Cancel01Icon} size={18} color={colors.error} />
                                <Typography variant="body" color={colors.error}>Cancel</Typography>
                            </Pressable>
                        </View>
                    </View>
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
        paddingHorizontal: 14,
    },
    conciergeHeader: {
        minHeight: 76,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1.5,
        borderRadius: 22,
        padding: 10,

        transform: [{ rotate: '-0.3deg' }],
    },
    headerTape: { position: 'absolute', top: -8, left: '44%', width: 54, height: 15, borderWidth: 1, transform: [{ rotate: '3deg' }] },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 0.9 },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 13,
        borderWidth: 1.25,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '-3deg' }],
    },
    aiBranding: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        borderWidth: 0.75,
    },
    headerAction: {
        width: 36,
        height: 36,
        borderRadius: 11,
        borderWidth: 1.25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aiAvatar: {
        width: 36,
        height: 36,
        borderRadius: 12,
        borderWidth: 1.25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageList: {
        paddingVertical: 20,
    },
    messageArea: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 8,
    },
    inputWrapper: {
        flex: 1,
        marginRight: 0,
    },
    input: {
        height: 48,
        borderRadius: 17,
        borderWidth: 1.5,
        paddingHorizontal: 20,
        fontSize: moderateScale(16),
    },
    sendBtn: {
        width: 48,
        height: 48,
        borderRadius: 15,
        borderWidth: 1.5,
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
        borderRadius: 18,
        borderWidth: 1.5,
        gap: 8,
    },
    gridCardContent: {
        width: '100%',
        alignItems: 'center',
    },
    gridProductImage: {
        width: '100%',
        height: 110,
        borderRadius: 11,
        borderWidth: 1,
        borderColor: '#17151D',
    },
    productPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
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
        borderWidth: 1.5,
    },
    overlay: {
        flex: 1,
    },
    floatingMenu: {
        position: 'absolute',
        width: 170,
        borderRadius: 16,
        borderWidth: 1.5,
        padding: 4,
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
    suggestionList: {
        gap: 10,
        marginTop: 12,
    },
    suggestionCard: {
        borderWidth: 1.5,
        borderRadius: 17,
        padding: 14,
        gap: 7,
    },
    suggestionHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    offPlatformBadge: {
        borderWidth: 1,
        borderRadius: 9,
        paddingHorizontal: 7,
        paddingVertical: 4,
    },
    requestSuggestionButton: {
        minHeight: 40,
        borderWidth: 1.25,
        borderRadius: 12,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 3,
    },
    createdRequestCard: {
        borderWidth: 1.5,
        borderRadius: 18,
        padding: 16,
        gap: 7,
        marginBottom: 14,
    },
    payRequestButton: {
        minHeight: 42,
        borderWidth: 1.25,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    unavailable: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    unavailableIcon: {
        width: 64,
        height: 64,
        borderWidth: 1.5,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unavailableButton: {
        minWidth: 140,
        minHeight: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
    },
});
