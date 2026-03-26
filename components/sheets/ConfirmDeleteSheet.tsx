import { useTheme } from '@/hooks/useTheme';
import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

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

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['25%']}>
                <View style={styles.content}>
                    <Typography variant="h3" align="center" style={{ marginBottom: spacing.sm }}>
                        {title}
                    </Typography>
                    <Typography variant="body" align="center" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                        {description}
                    </Typography>

                    <View style={styles.actions}>
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
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
});

export default ConfirmDeleteSheet;
