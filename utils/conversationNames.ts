import { Conversation } from '@/types';

export const getConversationNames = (conversation: Conversation, currentUserId?: string) => {
    const sender = conversation.participants.find((participant) => participant.id === currentUserId)
        || conversation.participants[0];
    const receivers = conversation.participants.filter((participant) => participant.id !== sender?.id);

    return {
        senderName: sender?.name || 'You',
        receiverName: conversation.order?.recipientName
            || receivers.map((participant) => participant.name).filter(Boolean).join(', ')
            || 'Recipient',
    };
};
