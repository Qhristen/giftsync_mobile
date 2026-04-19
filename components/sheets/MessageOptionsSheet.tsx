import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Typography from '../ui/Typography';

interface Props {
    textToCopy: string;
    onClose?: () => void;
}

const MessageOptionsSheet = forwardRef<BottomSheetRef, Props>(
    ({ textToCopy, onClose }, ref) => {
        const { colors, spacing } = useTheme();

        const handleCopy = async () => {
            if (textToCopy) {
                await Clipboard.setStringAsync(textToCopy);
                toast.success('Message copied!');
            }
            if (ref && 'current' in ref && typeof ref.current?.close === 'function') {
                ref.current.close();
            }
            onClose?.();
        };

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['20%']}>
                <View style={[styles.container, { paddingHorizontal: spacing.xl, paddingVertical: spacing.md }]}>
                    <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
                        Message Options
                    </Typography>

                    <Pressable
                        style={({ pressed }) => [
                            styles.option,
                            { backgroundColor: pressed ? colors.surfaceRaised : 'transparent', borderRadius: 12 }
                        ]}
                        onPress={handleCopy}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: colors.surfaceRaised }]}>
                            <Ionicons name="copy-outline" size={20} color={colors.textPrimary} />
                        </View>
                        <Typography variant="bodyBold">Copy Text</Typography>
                    </Pressable>
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
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MessageOptionsSheet;
