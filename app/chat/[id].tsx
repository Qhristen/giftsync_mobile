import GiftRequestOrderCard from '@/components/chat/GiftRequestOrderCard';
import MessageBubble from '@/components/chat/MessageBubble';
import ScrollToBottomButton from '@/components/chat/ScrollToBottomButton';
import ConversationOptionsSheet from '@/components/sheets/ConversationOptionsSheet';
import DisputeSheet from '@/components/sheets/DisputeSheet';
import OrderDetailSheet from '@/components/sheets/OrderDetailSheet';
import ReportSheet from '@/components/sheets/ReportSheet';
import Avatar from '@/components/ui/Avatar';
import { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Typography from '@/components/ui/Typography';
import { useSocket } from '@/hooks/useSocket';
import { useTheme } from '@/hooks/useTheme';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { RootState } from '@/store';
import { useGetConversationQuery, useGetMessagesQuery } from '@/store/api/chatApi';
import { useGetGiftRequestQuery } from '@/store/api/giftRequestApi';
import { useBlockUserMutation } from '@/store/api/trustSafetyApi';
import { useUploadMutation } from '@/store/api/uploadApi';
import { useAppSelector } from '@/store/hooks';
import { selectTypingUsers } from '@/store/slices/chatSlice';
import { ChatMessage } from '@/types';
import { getConversationNames } from '@/utils/conversationNames';
import { moderateScale } from '@/utils/scaling';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01Icon,
    Cancel01Icon,
    Copy01Icon,
    MoreHorizontalIcon,
    PlusSignCircleIcon,
    SentIcon
} from '@hugeicons/core-free-icons';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    GestureResponderEvent,
    Modal,
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
import { useSelector } from 'react-redux';
import { toast } from 'sonner-native';

const EMPTY_MESSAGES: ChatMessage[] = [];

export default function ChatDetailScreen() {
    const { id: conversationId } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const { enabled: trustSafetyEnabled } = useFeatureFlag('trust_safety');
    const { enabled: disputesEnabled } = useFeatureFlag('disputes');
    const insets = useSafeAreaInsets();
    const [messageText, setMessageText] = useState('');
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const convOptionsRef = useRef<BottomSheetRef>(null);
    const orderDetailsRef = useRef<BottomSheetRef>(null);
    const reportSheetRef = useRef<BottomSheetRef>(null);
    const disputeSheetRef = useRef<BottomSheetRef>(null);
    const [isOptionsVisible, setIsOptionsVisible] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
    const [viewerConfig, setViewerConfig] = useState<{ images: string[], index: number } | null>(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const socketService = useSocket();

    const { user } = useAppSelector(s => s.auth);
    const { data: conversation, isLoading: isConvLoading } = useGetConversationQuery(conversationId);
    const {
        data,
        isLoading: isMessagesLoading,
    } = useGetMessagesQuery({ conversationId, limit: 50 });
    const giftRequestId = conversation?.giftRequest?.id;
    const { data: giftRequest } = useGetGiftRequestQuery(giftRequestId || '', {
        skip: !giftRequestId,
        pollingInterval: 15000,
        refetchOnMountOrArgChange: true,
        refetchOnReconnect: true,
    });

    const [upload] = useUploadMutation();
    const [blockUser] = useBlockUserMutation();
    const typingUsers = useSelector((state: RootState) => selectTypingUsers(state, conversationId));

    const messages = data?.items ?? EMPTY_MESSAGES;
    const memoizedMessages = useMemo(() => [...messages].reverse(), [messages]);
    const isLoading = isMessagesLoading && messages.length === 0;
    const currentUserId = user?.id;

    const participants = useMemo(() =>
        conversation?.participants?.filter(p => p.id !== user?.id) || [],
    [conversation?.participants, user?.id]
    );

    const displayName = conversation?.order?.item?.product?.name || 'Chat';
    const conversationNames = conversation ? getConversationNames(conversation, currentUserId) : null;
    const avatarSize = 28;
    const overlap = 10;
    const groupWidth = participants.length > 0
        ? avatarSize + (participants.length - 1) * (avatarSize - overlap)
        : avatarSize;

    useEffect(() => {
        if (conversationId) {
            socketService.joinConversation(conversationId);
            socketService.markAsRead(conversationId);
            return () => {
                socketService.leaveConversation(conversationId);
            };
        }
    }, [conversationId, socketService]);

    const handleSend = async () => {
        if (!messageText.trim() && selectedImages.length === 0) return;

        const content = messageText.trim();
        const imagesToUpload = [...selectedImages];

        setMessageText('');
        setSelectedImages([]);
        socketService.sendTyping(conversationId, false);

        // 1. First make optimistic update to the Ui with local URIs
        const result = socketService.addOptimisticMessage(conversationId, content, imagesToUpload);
        const manualMessage = result?.optimisticMessage;
        const patch = result?.patch;

        setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
            setShowScrollToBottom(false);
        }, 100);

        try {
            let uploadedUrls: string[] = [];
            if (imagesToUpload.length > 0) {
                try {
                    uploadedUrls = await Promise.all(
                        imagesToUpload.map(uri => upload(uri).unwrap())
                    );
                } catch {
                    toast.error('Failed to upload images');
                    patch?.undo();
                    // Put them back in state so user can retry
                    setSelectedImages(imagesToUpload);
                    setMessageText(content);
                    return;
                }
            }

            // 2. Send real message to server, skipping internal optimistic update since we did it manually
            // We pass manualMessage.id so the socket service can replace it with the real server message
            await socketService.sendMessage(
                conversationId,
                content,
                uploadedUrls.length > 0 ? uploadedUrls : [],
                true,
                manualMessage?.id
            );

            // removed patch?.undo() here because sendMessage ack or newMessage event
            // will handle the replacement of the temp message with the real one.
            // Undoing the patch here would remove the message from the UI entirely if the
            // replacement already happened or if the undo logic is over-aggressive.
        } catch (error) {
            console.error('Failed to send message:', error);
            patch?.undo();
            setMessageText(current => current || content);
            setSelectedImages(current => current.length > 0 ? current : imagesToUpload);
            toast.error(typeof error === 'string' ? error : 'Message could not be sent. Please try again.');
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

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                quality: 0.8,
                allowsMultipleSelection: true,
            });

            if (!result.canceled) {
                const newImages = result.assets.map(asset => asset.uri);
                setSelectedImages(prev => [...prev, ...newImages]);
            }
        } catch (error) {
            console.error('Pick image error:', error);
            toast.error('Could not pick image');
        }
    };

    const handleLongPress = useCallback((message: ChatMessage, event: GestureResponderEvent) => {
        const { pageX, pageY } = event.nativeEvent;
        setMenuPosition({ x: pageX, y: pageY });
        setSelectedMessage(message);
        setIsOptionsVisible(true);
    }, []);

    const handleImagePress = useCallback((images: string[], index: number) => {
        setViewerConfig({ images, index });
    }, []);

    const renderMessage = useCallback(({ item }: { item: ChatMessage }) => (
        <MessageBubble
            message={item}
            isOwnMessage={item.sender.id === currentUserId}
            onLongPress={handleLongPress}
            onImagePress={handleImagePress}
        />
    ), [currentUserId, handleImagePress, handleLongPress]);

    const messageListContentStyle = useMemo(
        () => [styles.messageList, { paddingBottom: spacing.lg }],
        [spacing.lg],
    );

    const handleMessageScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const shouldShow = event.nativeEvent.contentOffset.y > 120;
        setShowScrollToBottom((current) => current === shouldShow ? current : shouldShow);
    }, []);

    const scrollToBottom = useCallback(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        setShowScrollToBottom(false);
    }, []);

    const handleGiftRequestPayment = useCallback(() => {
        if (!giftRequest?.orderId) return;

        router.push({
            pathname: '/checkout/payment',
            params: {
                orderId: giftRequest.orderId,
                giftRequestId: giftRequest.id,
                currency: giftRequest.currency,
            },
        });
    }, [giftRequest, router]);

    const acceptedOrderCard = useMemo(() => {
        if (
            !giftRequest?.order
            || (giftRequest.status !== 'SOURCING' && giftRequest.status !== 'FULFILLED')
        ) return null;

        return (
            <GiftRequestOrderCard
                order={giftRequest.order}
                currency={giftRequest.currency}
                recipientName={giftRequest.recipientName || conversation?.giftRequest?.recipientName}
                category={giftRequest.category || conversation?.giftRequest?.category}
                onPay={handleGiftRequestPayment}
            />
        );
    }, [conversation?.giftRequest, giftRequest, handleGiftRequestPayment]);

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
        convOptionsRef.current?.close();
        setTimeout(() => {
            orderDetailsRef.current?.expand();
        }, 500);
    };

    const handleBlockUser = () => {
        const otherParticipant = participants[0];
        if (!otherParticipant) return;

        Alert.alert(
            'Block User',
            `Are you sure you want to block ${otherParticipant.name}? You will no longer receive messages from them.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Block',
                    style: 'destructive',
                    onPress: async () => {
                        const request = blockUser({ blockedId: otherParticipant.id });
                        router.back();
                        try {
                            await request.unwrap();
                            toast.success('User blocked');
                        } catch (error: any) {
                            toast.error('Error', { description: error?.data?.message || 'Failed to block user' });
                        }
                    }
                }
            ]
        );
    };

    const handleReportUser = () => {
        convOptionsRef.current?.close();
        setTimeout(() => {
            reportSheetRef.current?.expand();
        }, 500);
    };

    const handleOpenDispute = () => {
        orderDetailsRef.current?.close();
        setTimeout(() => {
            disputeSheetRef.current?.expand();
        }, 500);
    };

    if (isConvLoading) {
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
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={28} color={colors.textPrimary} />
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
                    <View style={styles.headerCopy}>
                        <Typography variant="bodyBold" numberOfLines={1}>{displayName}</Typography>
                        {conversationNames && (
                            <Typography variant="caption" color={colors.textSecondary} numberOfLines={1}>
                                Sender: {conversationNames.senderName} · Receiver: {conversationNames.receiverName}
                            </Typography>
                        )}
                        {typingUsers.length > 0 && (
                            <Typography variant="caption" color={colors.primary}>typing...</Typography>
                        )}
                    </View>
                </View>

                <Pressable onPress={handleHeaderOptions} style={styles.headerRightBtn}>
                    <HugeiconsIcon icon={MoreHorizontalIcon} size={24} color={colors.textPrimary} />
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
                    <View style={styles.messageArea}>
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
                            renderItem={renderMessage}
                            style={{ flex: 1 }}
                            contentContainerStyle={messageListContentStyle}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                            ListHeaderComponent={acceptedOrderCard}
                            onScroll={handleMessageScroll}
                            scrollEventThrottle={16}
                        />
                        <ScrollToBottomButton visible={showScrollToBottom} onPress={scrollToBottom} />
                    </View>
                )}

                {selectedImages.length > 0 && (
                    <View style={[styles.imagePreviewContainer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
                        <FlatList
                            data={selectedImages}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(uri, index) => `${uri}-${index}`}
                            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12 }}
                            renderItem={({ item: uri, index }) => (
                                <View style={styles.previewWrapper}>
                                    <Image source={{ uri }} style={styles.imagePreview} />
                                    <Pressable
                                        onPress={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                                        style={[styles.removeBtn, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}
                                    >
                                        <HugeiconsIcon icon={Cancel01Icon} size={12} color={colors.textPrimary} />
                                    </Pressable>
                                </View>
                            )}
                        />
                    </View>
                )}

                <View style={[
                    styles.inputContainer,
                    {
                        borderTopColor: colors.border,
                        backgroundColor: colors.surface,
                        paddingBottom: insets.bottom + 12,
                    }
                ]}>
                    <Pressable
                        onPress={handlePickImage}
                        style={styles.attachBtn}
                    >
                        <HugeiconsIcon icon={PlusSignCircleIcon} size={28} color={colors.textSecondary} />
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
                        disabled={!messageText.trim() && selectedImages.length === 0}
                        style={[
                            styles.sendBtn,
                            {
                                backgroundColor: (messageText.trim() || selectedImages.length > 0) ? colors.primary : colors.surfaceRaised,
                            }
                        ]}
                    >
                        <HugeiconsIcon
                            icon={SentIcon}
                            size={20}
                            color={(messageText.trim() || selectedImages.length > 0) ? '#FFFFFF' : colors.textMuted}
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

            <ConversationOptionsSheet
                ref={convOptionsRef}
                conversation={conversation || null}
                onViewOrder={handleViewOrder}
                onBlockUser={trustSafetyEnabled ? handleBlockUser : undefined}
                onReportUser={trustSafetyEnabled ? handleReportUser : undefined}
            />

            <OrderDetailSheet
                ref={orderDetailsRef}
                order={conversation?.order || null}
                onChat={() => {
                    orderDetailsRef.current?.close();
                }}
                onDispute={disputesEnabled ? handleOpenDispute : undefined}
            />

            <ReportSheet
                ref={reportSheetRef}
                targetId={participants[0]?.id || ''}
                type="user"
                onSuccess={() => reportSheetRef.current?.close()}
            />

            <DisputeSheet
                ref={disputeSheetRef}
                orderId={conversation?.order?.id || ''}
                onSuccess={() => {
                    disputeSheetRef.current?.close();
                    orderDetailsRef.current?.close();
                }}
            />

            <Modal
                visible={!!viewerConfig}
                transparent={true}
                onRequestClose={() => setViewerConfig(null)}
            >
                <View style={[styles.viewerContainer, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
                    <Pressable
                        style={[styles.viewerCloseBtn, { top: insets.top + 10 }]}
                        onPress={() => setViewerConfig(null)}
                    >
                        <HugeiconsIcon icon={Cancel01Icon} size={32} color="#FFFFFF" />
                    </Pressable>
                    {viewerConfig && (
                        <FlatList
                            data={viewerConfig.images}
                            horizontal
                            pagingEnabled
                            initialScrollIndex={viewerConfig.index}
                            getItemLayout={(_, index) => ({
                                length: screenWidth,
                                offset: screenWidth * index,
                                index,
                            })}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(uri, index) => `${uri}-${index}`}
                            renderItem={({ item: uri }) => (
                                <View style={{ width: screenWidth, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                                    <Image
                                        source={{ uri }}
                                        style={styles.viewerImage}
                                        contentFit="contain"
                                    />
                                </View>
                            )}
                        />
                    )}
                </View>
            </Modal>
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
    headerCopy: {
        flex: 1,
    },
    headerRightBtn: {
        padding: 8,
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
        fontSize: moderateScale(16),
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
    },
    menuSeparator: {
        height: 1,
        marginHorizontal: 12,
    },
    imagePreviewContainer: {
        borderTopWidth: 1,
    },
    previewWrapper: {
        position: 'relative',
    },
    imagePreview: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    removeBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    viewerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewerImage: {
        width: '100%',
        height: '100%',
    },
    viewerCloseBtn: {
        position: 'absolute',
        right: 20,
        zIndex: 10,
        padding: 8,
    },
});
