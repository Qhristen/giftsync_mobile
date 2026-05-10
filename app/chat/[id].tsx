import MessageBubble from '@/components/chat/MessageBubble';
import ConversationOptionsSheet from '@/components/sheets/ConversationOptionsSheet';
import DisputeSheet from '@/components/sheets/DisputeSheet';
import OrderDetailSheet from '@/components/sheets/OrderDetailSheet';
import ReportSheet from '@/components/sheets/ReportSheet';
import Avatar from '@/components/ui/Avatar';
import { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Typography from '@/components/ui/Typography';
import { useChatSocket } from '@/hooks/useChatSocket';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { useGetConversationQuery, useGetMessagesQuery } from '@/store/api/chatApi';
import { useBlockUserMutation } from '@/store/api/trustSafetyApi';
import { useUploadMutation } from '@/store/api/uploadApi';
import { useAppSelector } from '@/store/hooks';
import { selectTypingUsers } from '@/store/slices/chatSlice';
import { ChatMessage } from '@/types';
import { moderateScale } from '@/utils/scaling';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    GestureResponderEvent,
    Modal,
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
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
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
    const socketService = useChatSocket();

    const { user } = useAppSelector(s => s.auth);
    const { data: conversation, isLoading: isConvLoading } = useGetConversationQuery(conversationId);
    const {
        data,
        isLoading: isMessagesLoading,
    } = useGetMessagesQuery({ conversationId, limit: 50 });

    const [upload] = useUploadMutation();
    const [blockUser] = useBlockUserMutation();
    const typingUsers = useSelector((state: RootState) => selectTypingUsers(state, conversationId));

    const messages = data?.items || [];
    const memoizedMessages = useMemo(() => [...messages].reverse(), [messages]);
    const isLoading = isMessagesLoading && messages.length === 0;
    const currentUserId = user?.id;

    const participants = useMemo(() =>
        conversation?.participants?.filter(p => p.id !== user?.id) || [],
        [conversation?.participants, user?.id]
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
            socketService.markAsRead(conversationId);
            return () => {
                socketService.leaveConversation(conversationId);
            };
        }
    }, [conversationId]);

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
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);

        try {
            let uploadedUrls: string[] = [];
            if (imagesToUpload.length > 0) {
                try {
                    uploadedUrls = await Promise.all(
                        imagesToUpload.map(uri => upload(uri).unwrap())
                    );
                } catch (error) {
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
                        try {
                            await blockUser({ blockedId: otherParticipant.id }).unwrap();
                            toast.success('User blocked');
                            router.back();
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
                                onImagePress={(images, index) => setViewerConfig({ images, index })}
                            />
                        )}
                        style={{ flex: 1 }}
                        contentContainerStyle={[styles.messageList, { paddingBottom: spacing.lg }]}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
                    />
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
                                        <Ionicons name="close" size={12} color={colors.textPrimary} />
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
                        disabled={!messageText.trim() && selectedImages.length === 0}
                        style={[
                            styles.sendBtn,
                            {
                                backgroundColor: (messageText.trim() || selectedImages.length > 0) ? colors.primary : colors.surfaceRaised,
                            }
                        ]}
                    >
                        <Ionicons
                            name="send"
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
                onBlockUser={handleBlockUser}
                onReportUser={handleReportUser}
                          />

            <OrderDetailSheet
                ref={orderDetailsRef}
                order={conversation?.order || null}
                onChat={() => {
                    orderDetailsRef.current?.close();
                }}
                onDispute={handleOpenDispute}
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
                animationType="fade"
                onRequestClose={() => setViewerConfig(null)}
            >
                <View style={[styles.viewerContainer, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
                    <Pressable
                        style={[styles.viewerCloseBtn, { top: insets.top + 10 }]}
                        onPress={() => setViewerConfig(null)}
                    >
                        <Ionicons name="close" size={32} color="#FFFFFF" />
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
