import { useTheme } from '@/hooks/useTheme';
import { Conversation } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Typography from '../ui/Typography';

interface Props {
    conversation: Conversation | null;
    onViewOrder?: () => void;
    onViewProfile?: () => void;
    onClearChat?: () => void;
    onDelete?: () => void;
}

const ConversationOptionsSheet = forwardRef<BottomSheetRef, Props>(
    ({ conversation, onViewOrder, onViewProfile, onClearChat, onDelete }, ref) => {
        const { colors, spacing } = useTheme();

        const options = [
            {
                label: 'View Order Details',
                icon: 'receipt-outline',
                onPress: onViewOrder,
                visible: !!conversation?.orderId,
            },
            {
                label: 'View Profile',
                icon: 'person-outline',
                onPress: onViewProfile,
            },
            {
                label: 'Clear Chat',
                icon: 'trash-outline',
                onPress: onClearChat,
                color: colors.error,
            },
            {
                label: 'Delete Conversation',
                icon: 'trash-bin-outline',
                onPress: onDelete,
                color: colors.error,
            },
        ];

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['40%']}>
                <View style={[styles.container, { paddingHorizontal: spacing.xl, paddingVertical: spacing.md }]}>
                    <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: spacing.md, textAlign: 'center' }}>
                        Conversation Options
                    </Typography>

                    {options.filter(o => o.visible !== false).map((option, index) => (
                        <Pressable
                            key={index}
                            style={({ pressed }) => [
                                styles.option,
                                { backgroundColor: pressed ? colors.surfaceRaised : 'transparent', borderRadius: 12 }
                            ]}
                            onPress={() => {
                                option.onPress?.();
                                if (ref && 'current' in ref) {
                                    (ref as any).current?.close();
                                }
                            }}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceRaised }]}>
                                <Ionicons name={option.icon as any} size={20} color={option.color || colors.textPrimary} />
                            </View>
                            <Typography variant="bodyBold" color={option.color}>
                                {option.label}
                            </Typography>
                        </Pressable>
                    ))}
                </View>
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 16,
        marginBottom: 4,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ConversationOptionsSheet;
