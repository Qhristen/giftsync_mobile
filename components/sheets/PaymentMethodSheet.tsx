import { useTheme } from '@/hooks/useTheme';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    CheckmarkCircle02Icon,
    CreditCardIcon,
} from '@hugeicons/core-free-icons';
import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Typography from '../ui/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const PAYMENT_METHODS = [
    { id: 'paystack', name: 'Paystack', icon: CreditCardIcon, color: '#0BA4DB' },
    // { id: 'stripe', name: 'Stripe', icon: CreditCardIcon, color: '#635BFF' },
    // { id: 'crypto', name: 'Cryptocurrency', icon: CreditCardIcon, color: '#F7931A' },
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
    const insets = useSafeAreaInsets();

    return (
        <BottomSheetWrapper ref={ref} snapPoints={['40%']}>
            <View style={[styles.modalHeader, { paddingTop: spacing.md, paddingBottom: spacing.lg }]}>
                <View><Typography variant="caption" color={colors.textSecondary} style={styles.overline}>SECURE CHECKOUT</Typography><Typography variant="h2">Pick a payment rail</Typography></View>
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
                                        borderColor: colors.ink,
                                        borderWidth: 1.5,
                                        backgroundColor: isSelected ? colors.mint : colors.sky,
                                        marginBottom: spacing.lg,
                                        padding: 12
                                    }
                                ]}
                            >
                                <View style={[styles.iconBox, { backgroundColor: colors.surface, borderColor: colors.ink, width: 44, height: 44, borderRadius: 14 }]}>
                                    <HugeiconsIcon icon={method.icon} size={21} color={colors.ink} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Typography variant="bodyBold">{method.name}</Typography>
                                </View>
                                {isSelected && (
                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} color={colors.ink} />
                                )}
                            </Card>
                        </Pressable>
                    );
                })}
            </View>

            <View style={{ marginTop: 'auto', marginBottom: insets.bottom + spacing.xl }}>
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
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 1 },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    packageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 19,
    },
    iconBox: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.25,
    },
});

PaymentMethodSheet.displayName = 'PaymentMethodSheet';

export default PaymentMethodSheet;
