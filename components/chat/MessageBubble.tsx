import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { ChatMessage } from '@/types';
import { format } from 'date-fns';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';

interface MessageBubbleProps {
    message: ChatMessage;
    isOwnMessage: boolean;
    onLongPress?: (message: ChatMessage) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage, onLongPress }) => {
    const { colors, spacing } = useTheme();

    const timeString = format(new Date(message.createdAt), 'HH:mm');

    const handleCopy = async () => {
        if (onLongPress) {
            onLongPress(message);
        } else if (message.content) {
            await Clipboard.setStringAsync(message.content);
            toast.success('Message copied!');
        }
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
                onLongPress={handleCopy}
                delayLongPress={250}
                style={({ pressed }) => [
                    styles.bubble,
                    {
                        backgroundColor: isOwnMessage ? colors.primary : colors.surfaceRaised,
                        borderBottomRightRadius: isOwnMessage ? 4 : 16,
                        borderBottomLeftRadius: isOwnMessage ? 16 : 4,
                        padding: spacing.md,
                        opacity: pressed ? 0.9 : 1,
                    },
                ]}
            >
                <Typography
                    variant="body"
                    color={isOwnMessage ? '#FFFFFF' : colors.textPrimary}
                >
                    {message.content}
                </Typography>
                <Typography
                    variant="label"
                    style={styles.time}
                    color={isOwnMessage ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary}
                >
                    {timeString}
                </Typography>
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
    time: {
        marginTop: 4,
        alignSelf: 'flex-end',
    },
});

export default MessageBubble;
