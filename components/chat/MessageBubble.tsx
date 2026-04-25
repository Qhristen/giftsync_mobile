import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { ChatMessage } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import React from 'react';
import { GestureResponderEvent, Pressable, StyleSheet, View } from 'react-native';

interface MessageBubbleProps {
    message: ChatMessage;
    isOwnMessage: boolean;
    onLongPress?: (message: ChatMessage, event: GestureResponderEvent) => void;
    onImagePress?: (attachments: string[], index: number) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, onLongPress, onImagePress }) => {
    const { colors, spacing } = useTheme();

    const timeString = format(new Date(message.createdAt), 'HH:mm');

    const handleLongPress = (event: GestureResponderEvent) => {
        if (onLongPress) {
            onLongPress(message, event);
        }
    };

    const renderAttachments = () => {
        if (!message.attachments?.length) return null;

        const isGrid = message.attachments.length > 1;

        return (
            <View style={[
                styles.attachmentsContainer,
                isGrid && styles.gridContainer
            ]}>
                {message.attachments.map((attachment, index) => (
                    <Pressable
                        key={`${message.id}-attachment-${index}`}
                        onPress={() => onImagePress?.(message.attachments, index)}
                        style={[
                            isGrid ? styles.gridAttachmentWrapper : styles.singleAttachmentWrapper,
                            {
                                borderTopLeftRadius: index === 0 ? 12 : 4,
                                borderTopRightRadius: (isGrid && index === 1) || (!isGrid && index === 0) ? 12 : 4,
                            }
                        ]}
                    >
                        <Image
                            source={{ uri: attachment }}
                            style={styles.attachmentImage}
                            contentFit="cover"
                            transition={200}
                        />
                    </Pressable>
                ))}
            </View>
        );
    };

    return (
        <View
            style={[
                styles.container,
                {
                    alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
                    marginBottom: spacing.sm,
                    paddingHorizontal: spacing.xl,
                },
            ]}
        >
            <Pressable
                onLongPress={handleLongPress}
                delayLongPress={250}
                style={({ pressed }) => [
                    styles.bubble,
                    {
                        backgroundColor: isOwnMessage ? colors.primary : colors.surfaceRaised,
                        borderBottomRightRadius: isOwnMessage ? 4 : 16,
                        borderBottomLeftRadius: isOwnMessage ? 16 : 4,
                        opacity: pressed ? 0.9 : 1,
                        overflow: 'hidden',
                    },
                ]}
            >
                {renderAttachments()}

                {(message.content || true) && (
                    <View style={{
                        paddingHorizontal: spacing.md,
                        paddingTop: message.attachments?.length && !message.content ? 0 : (message.attachments?.length ? spacing.sm : spacing.md),
                        paddingBottom: spacing.sm,
                    }}>
                        {message.content ? (
                            <Typography
                                variant="body"
                                color={isOwnMessage ? '#FFFFFF' : colors.textPrimary}
                                style={{ marginBottom: 4 }}
                            >
                                {message.content}
                            </Typography>
                        ) : null}

                        <View style={[
                            styles.footer,
                            {
                                marginRight: 0,
                                marginBottom: 0,
                            }
                        ]}>
                            <Typography
                                variant="label"
                                color={isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary}
                            >
                                {timeString}
                            </Typography>
                            {isOwnMessage && (
                                <Ionicons
                                    name={message.id.startsWith('temp-') ? "time-outline" : "checkmark-done"}
                                    size={14}
                                    color={message.id.startsWith('temp-')
                                        ? 'rgba(255, 255, 255, 0.7)'
                                        : (message.isRead ? '#40C4FF' : 'rgba(255, 255, 255, 0.7)')
                                    }
                                    style={{ marginLeft: 4 }}
                                />
                            )}
                        </View>
                    </View>
                )}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    bubble: {
        maxWidth: '80%',
        borderRadius: 16,
    },
    attachmentsContainer: {
        width: '100%',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 2,
    },
    singleAttachmentWrapper: {
        width: 240,
        height: 180,
    },
    gridAttachmentWrapper: {
        width: '49.5%',
        aspectRatio: 1,
    },
    attachmentImage: {
        width: '100%',
        height: '100%',
    },
    time: {
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
});

export default MessageBubble;
