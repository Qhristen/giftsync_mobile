import Avatar from '@/components/ui/Avatar';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Conversation } from '@/types';
import { getConversationNames } from '@/utils/conversationNames';
import { formatDateString, formatTime } from '@/utils/dateUtils';
import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface ConversationItemProps {
    conversation: Conversation;
    currentUserId?: string;
    onPress: (conversationId: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, currentUserId, onPress }) => {
    const { colors, spacing } = useTheme();

    const participants = conversation.participants.filter(p => p.id !== currentUserId);
    const displayName = conversation?.order?.item?.product?.name || participants.map((participant) => participant.name).join(', ') || 'Gift conversation';
    const { senderName, receiverName } = getConversationNames(conversation, currentUserId);

    // Avatar group width: first avatar full-width + each additional offset by overlap
    const avatarSize = 55;
    const overlap = 14;
    const groupWidth = participants.length > 0
        ? avatarSize + (participants.length - 1) * (avatarSize - overlap)
        : avatarSize;

    const hasUnread = conversation.unreadCount !== undefined && conversation.unreadCount > 0;

    return (
        <Pressable
            onPress={() => onPress(conversation.id)}
            style={({ pressed }) => [
                styles.container,
                {
                    backgroundColor: pressed ? colors.mint : colors.surface,
                    borderColor: colors.ink,
                    marginHorizontal: spacing.xl,
                    paddingHorizontal: spacing.md,
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
                            borderColor: colors.ink,
                        }}
                    />
                ))}
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Typography
                        variant="bodyBold"
                        numberOfLines={2}
                        style={styles.name}
                        color={hasUnread ? colors.textPrimary : colors.textSecondary}
                    >
                        {displayName}
                    </Typography>
                    <Typography variant="caption" color={hasUnread ? colors.primary : colors.textSecondary}>
                        {formatDateString(conversation.lastMessageAt)} • {formatTime(conversation.lastMessageAt)}
                    </Typography>
                </View>
                <Typography
                    variant="caption"
                    color={colors.textSecondary}
                    numberOfLines={1}
                    style={styles.participants}
                >
                    Sender: {senderName} · Receiver: {receiverName}
                </Typography>
                <View style={styles.footer}>
                    <Typography
                        variant="body"
                        color={hasUnread ? colors.textPrimary : colors.textSecondaryForeground}
                        numberOfLines={1}
                        style={[
                            styles.preview,
                            hasUnread && { fontWeight: '500' }
                        ]}
                    >
                       Last message: {conversation.lastMessagePreview || 'No messages yet'}
                    </Typography>
                    {hasUnread && (
                        <View style={[styles.badge, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                            <Typography variant="caption" color="#17151D" style={{ fontWeight: 'bold' }}>
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
        borderWidth: 1.5,
        borderRadius: 19,
        marginBottom: 12,
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
    participants: {
        fontSize: moderateScale(11),
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    preview: {
        flex: 1,
        marginRight: 8,
        fontSize: moderateScale(12)
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1,
    },
});

export default React.memo(ConversationItem);
