import { useTheme } from '@/hooks/useTheme';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Copy01Icon } from '@hugeicons/core-free-icons';
import * as Clipboard from 'expo-clipboard';
import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Typography from '../ui/Typography';
import { moderateScale } from '@/utils/scaling';

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
                            { backgroundColor: pressed ? colors.surfaceRaised : 'transparent', borderRadius: moderateScale(12) }
                        ]}
                        onPress={handleCopy}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: colors.surfaceRaised }]}>
                            <HugeiconsIcon icon={Copy01Icon} size={moderateScale(20)} color={colors.textPrimary} />
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
        padding: moderateScale(12),
        gap: moderateScale(16),
    },
    iconContainer: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(20),
        justifyContent: 'center',
        alignItems: 'center',
    },
});

MessageOptionsSheet.displayName = 'MessageOptionsSheet';

export default MessageOptionsSheet;
