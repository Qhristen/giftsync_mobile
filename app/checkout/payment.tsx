import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { spendCoins } from '@/store/slices/walletSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';

export default function PaymentScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, spacing } = useTheme();
    const { coins } = useSelector((state: RootState) => state.wallet);

    const [paymentMethod, setPaymentMethod] = useState('paystack');
    const [showWebView, setShowWebView] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const promoSheet = useBottomSheet();

    const handlePay = () => {
        if (paymentMethod === 'coins') {
            if (coins < 5) {
                alert('Insufficient coins. Please top up.');
                return;
            }
            setIsProcessing(true);
            setTimeout(() => {
                dispatch(spendCoins(5));
                setIsProcessing(false);
                router.push('/checkout/confirmation');
            }, 1500);
        } else {
            setShowWebView(true);
        }
    };

    const handleWebViewStateChange = (newNavState: any) => {
        const { url } = newNavState;
        if (!url) return;

        if (url.includes('success') || url.includes('callback')) {
            setShowWebView(false);
            router.push('/checkout/confirmation');
        }
        if (url.includes('cancel') || url.includes('fail')) {
            setShowWebView(false);
            alert('Payment failed or cancelled.');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { padding: spacing.xl, paddingBottom: spacing.md }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h2">Payment</Typography>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { padding: spacing.xl }]}>
                {/* Order Summary */}
                <Typography variant="label" style={{ marginBottom: spacing.sm }}>Order Summary</Typography>
                <Card variant="outline" style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Typography variant="bodyMedium">Birthday Gift Package</Typography>
                        <Typography variant="bodyBold">NGN 14,500</Typography>
                    </View>
                    <Typography variant="caption" color={colors.textSecondary}>Included: Card, Wrap, Delivery</Typography>
                </Card>

                {/* Payment Methods */}
                <Typography variant="label" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Select Payment Method</Typography>

                {/* Paystack Option */}
                <Card
                    variant="outline"
                    onPress={() => setPaymentMethod('paystack')}
                    style={[styles.paymentMethodCard, paymentMethod === 'paystack' && { borderColor: colors.primary, borderWidth: 2 }]}
                >
                    <View style={[styles.methodIcon, { backgroundColor: colors.surfaceRaised }]}>
                        <Ionicons name="card-outline" size={24} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Typography variant="bodyBold">Debit/Credit Card</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>Secure payment via Paystack</Typography>
                    </View>
                    {paymentMethod === 'paystack' && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                </Card>

                {/* Coins Option */}
                <Card
                    variant="outline"
                    onPress={() => setPaymentMethod('coins')}
                    style={[styles.paymentMethodCard, { marginTop: spacing.md }, paymentMethod === 'coins' && { borderColor: colors.primary, borderWidth: 2 }]}
                >
                    <View style={[styles.methodIcon, { backgroundColor: colors.surfaceRaised }]}>
                        <Ionicons name="cash-outline" size={24} color={colors.success} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Typography variant="bodyBold">GiftSync Coins</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>Balance: {coins} Coins</Typography>
                    </View>
                    {paymentMethod === 'coins' && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                </Card>

                {/* Breakdown */}
                <View style={styles.breakdown}>
                    <View style={styles.breakdownRow}>
                        <Typography variant="body" color={colors.textSecondary}>Subtotal</Typography>
                        <Typography variant="body">NGN 12,500</Typography>
                    </View>
                    <View style={styles.breakdownRow}>
                        <Typography variant="body" color={colors.textSecondary}>Delivery</Typography>
                        <Typography variant="body">NGN 2,000</Typography>
                    </View>
                    <View style={styles.breakdownRow}>
                        <Typography variant="bodyBold">Total</Typography>
                        <Typography variant="h3" color={colors.primary}>NGN 14,500</Typography>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Button
                    title={isProcessing ? "Processing..." : paymentMethod === 'coins' ? 'Pay with 5 Coins' : `Pay NGN 14,500`}
                    onPress={handlePay}
                    isLoading={isProcessing}
                    style={styles.submitBtn}
                />
            </View>

            {/* Paystack WebView Modal */}
            <Modal visible={showWebView} animationType="slide">
                <View style={{ flex: 1, paddingTop: 50 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16 }}>
                        <Button title="Cancel" variant="ghost" onPress={() => setShowWebView(false)} />
                    </View>
                    <WebView
                        source={{ uri: 'https://checkout.paystack.com/mock-authorization-url' }}
                        onNavigationStateChange={handleWebViewStateChange}
                        startInLoadingState={true}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        padding: 8,
    },
    content: {
        flexGrow: 1,
    },
    summaryCard: {
        padding: 16,
        gap: 4,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentMethodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
        borderRadius: 16,
        backgroundColor: 'transparent',
    },
    methodIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    breakdown: {
        marginTop: 32,
        gap: 12,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footer: {
        width: '100%',
    },
    submitBtn: {
        width: '100%',
    },
});
