import Avatar from '@/components/ui/Avatar';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Conversation } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface ConversationItemProps {
    conversation: Conversation;
    onPress: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onPress }) => {
    const { colors, spacing } = useTheme();

    const participants = conversation.participants || [];
    const displayName = conversation?.order?.item?.product?.name

    const lastMessageDate = conversation.lastMessageAt
        ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
        : '';

    // Avatar group width: first avatar full-width + each additional offset by overlap
    const avatarSize = 42;
    const overlap = 14;
    const groupWidth = participants.length > 0
        ? avatarSize + (participants.length - 1) * (avatarSize - overlap)
        : avatarSize;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.container,
                {
                    backgroundColor: pressed ? colors.surfaceRaised : colors.background,
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.md,
                },
            ]}
        >
            <View style={[styles.avatarGroup, { width: groupWidth, height: avatarSize }]}>
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
                            borderWidth: 2,
                            borderColor: colors.background,
                        }}
                    />
                ))}
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Typography variant="bodyBold" numberOfLines={1} style={styles.name}>
                        {displayName}
                    </Typography>
                    <Typography variant="caption" color={colors.textSecondary}>
                        {lastMessageDate}
                    </Typography>
                </View>
                <View style={styles.footer}>
                    <Typography
                        variant="body"
                        color={colors.textSecondary}
                        numberOfLines={1}
                        style={styles.preview}
                    >
                        {conversation.lastMessagePreview || 'No messages yet'}
                    </Typography>
                    {conversation.unreadCount !== undefined && conversation.unreadCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                            <Typography variant="caption" color="#FFFFFF">
                                {conversation.unreadCount}
                            </Typography>
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarGroup: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        gap: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        flex: 1,
        marginRight: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    preview: {
        flex: 1,
        marginRight: 8,
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
});

export default ConversationItem;
