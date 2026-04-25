import { useTheme } from '@/hooks/useTheme';
import { useCreateDisputeMutation } from '@/store/api/disputeApi';
import React, { forwardRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

interface Props {
    orderId: string;
    onSuccess?: () => void;
}

const DisputeSheet = forwardRef<BottomSheetRef, Props>(
    ({ orderId, onSuccess }, ref) => {
        const { spacing, colors } = useTheme();
        const [reason, setReason] = useState('');
        const [description, setDescription] = useState('');
        const [createDispute, { isLoading }] = useCreateDisputeMutation();

        const handleSubmit = async () => {
            if (!reason.trim()) {
                toast.error('Please provide a reason for the dispute');
                return;
            }

            try {
                await createDispute({
                    orderId,
                    reason,
                    description,
                }).unwrap();

                toast.success('Dispute Opened', {
                    description: 'An admin will review and resolve the dispute shortly.'
                });

                setReason('');
                setDescription('');
                onSuccess?.();
                if (ref && 'current' in ref) {
                    (ref as any).current?.close();
                }
            } catch (error: any) {
                toast.error('Error', {
                    description: error?.data?.message || 'Failed to open dispute'
                });
            }
        };

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['50%']} 
                scrollable
                keyboardBehavior="interactive"
                android_keyboardInputMode="adjustPan">
                <View style={[styles.container, { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs }]}>
                    <Typography variant="h2" style={{ marginBottom: spacing.xs }}>Open Dispute</Typography>
                    <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.lg }}>
                        Raise a dispute for this order.
                    </Typography>

                    <View style={{ gap: spacing.xl }}>
                        <Input
                            label="Reason"
                            placeholder="e.g. Item not received, Damaged goods, etc."
                            value={reason}
                            onChangeText={setReason}
                            isBottomSheet
                        />
                        <Input
                            label="Detailed Description"
                            placeholder="Provide details and evidence for your dispute..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            style={{ height: 100 }}
                            isBottomSheet
                        />

                        <Button
                            title="Open Dispute"
                            onPress={handleSubmit}
                            isLoading={isLoading}
                            variant="primary"
                            color={colors.error}
                            style={{ marginTop: spacing.md }}
                        />
                    </View>
                </View>
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default DisputeSheet;
