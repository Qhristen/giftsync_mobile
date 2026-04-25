import { useTheme } from '@/hooks/useTheme';
import { useSubmitReportMutation } from '@/store/api/trustSafetyApi';
import { ReportType } from '@/types';
import React, { forwardRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

interface Props {
    targetId: string;
    type: ReportType;
    onSuccess?: () => void;
}

const ReportSheet = forwardRef<BottomSheetRef, Props>(
    ({ targetId, type, onSuccess }, ref) => {
        const { spacing, colors } = useTheme();
        const [reason, setReason] = useState('');
        const [description, setDescription] = useState('');
        const [submitReport, { isLoading }] = useSubmitReportMutation();

        const handleSubmit = async () => {
            if (!reason.trim()) {
                toast.error('Please provide a reason for reporting');
                return;
            }

            try {
                await submitReport({
                    targetId,
                    type,
                    reason,
                    description,
                }).unwrap();

                toast.success('Report submitted', {
                    description: 'Thank you for helping us keep the community safe. We will review your report shortly.'
                });

                setReason('');
                setDescription('');
                onSuccess?.();
                if (ref && 'current' in ref) {
                    (ref as any).current?.close();
                }
            } catch (error: any) {
                toast.error('Error', {
                    description: error?.data?.message || 'Failed to submit report'
                });
            }
        };

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['50%']}
                scrollable
                keyboardBehavior="interactive"
                android_keyboardInputMode="adjustPan">
                <View style={[styles.container, { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs }]}>
                    <Typography variant="h2" style={{ marginBottom: spacing.xs }}>Report {type.replace('_', ' ')}</Typography>
                    <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.lg }}>
                        Please tell us why you are reporting this {type.replace('_', ' ')}.
                    </Typography>

                    <View style={{ gap: spacing.xl }}>
                        <Input
                            label="Reason"
                            placeholder="e.g. Inappropriate content, Scam, etc."
                            value={reason}
                            onChangeText={setReason}
                            isBottomSheet
                        />
                        <Input
                            label="Additional Context (Optional)"
                            placeholder="Provide more details about your report..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            style={{ height: 100 }}
                            isBottomSheet
                        />

                        <Button
                            title="Submit Report"
                            onPress={handleSubmit}
                            isLoading={isLoading}
                            variant="primary"
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

export default ReportSheet;
