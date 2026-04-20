import { useTheme } from '@/hooks/useTheme';
import { useConfirmDeliveryMutation } from '@/store/api/orderApi';
import { Order } from '@/types';
import React, { forwardRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

interface Props {
    order: Order | null;
    onSuccess: () => void;
}

const ConfirmDeliverySheet = forwardRef<BottomSheetRef, Props>(
    ({ order, onSuccess }, ref) => {
        const { spacing, colors } = useTheme();
        const [deliveryCode, setDeliveryCode] = useState('');

        const [confirmDelivery, { isLoading }] = useConfirmDeliveryMutation();

        const handleConfirm = async () => {
            if (!order || !deliveryCode.trim()) return;

            try {
                await confirmDelivery({
                    orderId: order.id,
                    deliveryCode: deliveryCode.trim()
                }).unwrap();

                setDeliveryCode('');
                onSuccess();
            } catch (error: any) {
                console.error('Failed to confirm delivery:', error);
                const errorMsg = error?.data?.message || 'Invalid delivery code. Please verify and try again.';
                alert(errorMsg);
            }
        };

        if (!order) return null;

        return (
            <BottomSheetWrapper ref={ref}
                snapPoints={['35%', '40%']}
                scrollable
                keyboardBehavior="interactive"
                android_keyboardInputMode="adjustPan">
                <View style={styles.content}>
                    <Typography variant="h2" align="center" style={{ marginBottom: spacing.sm }}>
                        Confirm Delivery
                    </Typography>
                    <Typography variant="body" align="center" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                        Enter the unique confirmation code provided by the recipient to mark Order #{order.id.slice(-6).toUpperCase()} as delivered.
                    </Typography>

                    <Input
                        label="Recipient's Delivery Code"
                        placeholder="e.g. GS-4821"
                        value={deliveryCode}
                        onChangeText={setDeliveryCode}
                        isBottomSheet
                        keyboardType="default"
                        autoCapitalize="characters"
                    />

                    <Button
                        title="Mark as Delivered"
                        onPress={handleConfirm}
                        isLoading={isLoading}
                        disabled={!deliveryCode.trim()}
                        style={{ marginTop: spacing.xl }}
                    />
                </View>
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    content: {
        paddingVertical: 12,
    },
});

export default ConfirmDeliverySheet;
