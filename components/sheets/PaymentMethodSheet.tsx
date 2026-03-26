import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Typography from '../ui/Typography';

export const PAYMENT_METHODS = [
    { id: 'paystack', name: 'Paystack', icon: 'card-outline', color: '#0BA4DB' },
    { id: 'stripe', name: 'Stripe', icon: 'logo-usd', color: '#635BFF' },
    { id: 'crypto', name: 'Cryptocurrency', icon: 'logo-bitcoin', color: '#F7931A' },
];

export interface PaymentMethodSheetProps {
    selectedMethod: string;
    onSelectMethod: (methodId: string) => void;
    onConfirm: () => void;
    confirmButtonText?: string;
    isProcessing?: boolean;
}

const PaymentMethodSheet = forwardRef<BottomSheetRef, PaymentMethodSheetProps>(({
    selectedMethod,
    onSelectMethod,
    onConfirm,
    confirmButtonText = 'Confirm Purchase',
    isProcessing = false
}, ref) => {
    const { colors, spacing } = useTheme();

    return (
        <BottomSheetWrapper ref={ref} snapPoints={['40%']}>
            <View style={[styles.modalHeader, { paddingTop: spacing.md, paddingBottom: spacing.lg }]}>
                <Typography variant="h4">Select Payment Method</Typography>
            </View>

            <View style={{}}>
                {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                        <Pressable key={method.id} onPress={() => onSelectMethod(method.id)}>
                            <Card
                                style={[
                                    styles.packageCard,
                                    {
                                        borderColor: isSelected ? colors.primary : 'transparent',
                                        borderWidth: 2,
                                        backgroundColor: colors.surfaceRaised,
                                        marginBottom: spacing.lg,
                                        padding: 12
                                    }
                                ]}
                            >
                                <View style={[styles.iconBox, { backgroundColor: method.color + '1A', width: 40, height: 40, borderRadius: 20 }]}>
                                    <Ionicons name={method.icon as any} size={20} color={method.color} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Typography variant="bodyBold">{method.name}</Typography>
                                </View>
                                {isSelected && (
                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                )}
                            </Card>
                        </Pressable>
                    );
                })}
            </View>

            <View style={{ marginTop: 'auto', marginBottom: spacing.xl }}>
                <Button
                    title={confirmButtonText}
                    variant="primary"
                    disabled={!selectedMethod || isProcessing}
                    isLoading={isProcessing}
                    onPress={onConfirm}
                />
            </View>
        </BottomSheetWrapper>
    );
});

const styles = StyleSheet.create({
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    packageCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PaymentMethodSheet;
