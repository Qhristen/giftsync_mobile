import { useTheme } from '@/hooks/useTheme';
import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';

interface Props {
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

const ConfirmDeleteSheet = forwardRef<BottomSheetRef, Props>(
    ({ title, description, confirmLabel = 'Delete', cancelLabel = 'Cancel', onConfirm, onCancel, isLoading }, ref) => {
        const { spacing, colors } = useTheme();
        const insets = useSafeAreaInsets();

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['46%']}>
                <View style={styles.content}>
                    <View style={[styles.warningSeal, { backgroundColor: colors.peach, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={Alert01Icon} size={30} color={colors.ink} />
                    </View>
                    <Typography variant="caption" align="center" color={colors.textSecondary} style={styles.overline}>PLEASE CHECK THIS ACTION</Typography>
                    <Typography variant="h3" align="center" style={{ marginBottom: spacing.sm }}>
                        {title}
                    </Typography>
                    <Typography variant="body" align="center" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                        {description}
                    </Typography>

                    <View style={[styles.actions, { marginBottom: insets.bottom + 20 }]}>
                        <Button
                            title={cancelLabel}
                            variant="outline"
                            onPress={() => {
                                if (ref && 'current' in ref) ref.current?.close();
                                onCancel?.();
                            }}
                            style={{ flex: 1 }}
                        />
                        <Button
                            title={confirmLabel}
                            variant="destructive"
                            onPress={onConfirm}
                            isLoading={isLoading}
                            style={{ flex: 1 }}
                        />
                    </View>
                </View>
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    content: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    warningSeal: { width: 62, height: 62, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 9, transform: [{ rotate: '-4deg' }] },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 0.9, marginBottom: 3 },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        width: '100%',
    },
});

ConfirmDeleteSheet.displayName = 'ConfirmDeleteSheet';

export default ConfirmDeleteSheet;
