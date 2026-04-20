import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetOrderByIdQuery, useHandlePaymentMutation } from '@/store/api/orderApi';
import { useGetCoinQuoteQuery, useGetWalletBalanceQuery } from '@/store/api/walletApi';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner-native';

export default function PaymentScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, spacing } = useTheme();
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const { data: order, isLoading: isOrderLoading } = useGetOrderByIdQuery(orderId as string, { skip: !orderId });
    const [handlePayment] = useHandlePaymentMutation();
    const { data: wallet, refetch } = useGetWalletBalanceQuery()

    const { data: coinQuote, isLoading: isQuoteLoading } = useGetCoinQuoteQuery({
        amount: order?.total ?? 0,
        currency: order?.item?.product.currency,
    }, {
        skip: !order?.total,
    });

    const [paymentMethod, setPaymentMethod] = useState('coins');
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePay = async () => {
        try {
            setIsProcessing(true);
            const response = await handlePayment({
                orderId: order?.id as string,
                method: paymentMethod
            }).unwrap();

            if (response.paymentMethod === 'paystack' && response.status === "payment_initiated") {
                setPaymentUrl(response?.checkoutUrl as string);
            } else if (response.status === 'paid') {
                router.replace({
                    pathname: '/checkout/confirmation',
                    params: { orderId }
                });
            }
        } catch (error: any) {
            console.error('Payment Error:', error);
            toast.error(error?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWebViewStateChange = (newNavState: any) => {
        const { url } = newNavState;
        if (!url) return;

        // Backend redirects to success or fail URLs
        if (url.includes('success') || url.includes('callback')) {
            setPaymentUrl(null);
            router.push({
                pathname: '/checkout/confirmation',
                params: { orderId }
            });
        }
        if (url.includes('cancel') || url.includes('fail')) {
            setPaymentUrl(null);
            alert('Payment failed or cancelled.');
        }
    };

    if (isOrderLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

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
                        <Typography variant="bodyMedium">{order?.item?.product.name || 'Gift Item'}</Typography>
                        <Typography variant="bodyBold">{formatCurrency(order?.total ?? 0, order?.item?.product.currency)}</Typography>
                    </View>
                    <Typography variant="caption" color={colors.textSecondary}>
                        Order #{order?.id?.slice(-6).toUpperCase()}
                    </Typography>
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
                        <Typography variant="caption" color={colors.textSecondary}>Balance: {wallet?.balance.toLocaleString()} Coins</Typography>
                    </View>
                    {paymentMethod === 'coins' && (
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                </Card>

                {/* Breakdown */}
                <View style={styles.breakdown}>
                    <View style={styles.breakdownRow}>
                        <Typography variant="body" color={colors.textSecondary}>Subtotal</Typography>
                        <Typography variant="body">{formatCurrency(order?.subtotal ?? 0, order?.item?.product.currency)}</Typography>
                    </View>
                    <View style={styles.breakdownRow}>
                        <Typography variant="body" color={colors.textSecondary}>Delivery</Typography>
                        <Typography variant="body">{formatCurrency(order?.deliveryFee ?? 0, order?.item?.product.currency)}</Typography>
                    </View>
                    {order?.packagingFee ? (
                        <View style={styles.breakdownRow}>
                            <Typography variant="body" color={colors.textSecondary}>Packaging</Typography>
                            <Typography variant="body">{formatCurrency(order?.packagingFee ?? 0, order?.item?.product.currency)}</Typography>
                        </View>
                    ) : null}
                    <View style={styles.breakdownRow}>
                        <Typography variant="bodyBold">Total</Typography>
                        <Typography variant="h3" color={colors.primary}>{formatCurrency(order?.total ?? 0, order?.item?.product.currency)}</Typography>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Button
                    title={isProcessing ? "Processing..." : paymentMethod === 'coins' ? `Pay with ${coinQuote?.coins ? coinQuote.coins.toLocaleString() : '...'} Coins` : `Pay ${formatCurrency(order?.total ?? 0, order?.item?.product.currency)}`}
                    onPress={handlePay}
                    isLoading={isProcessing || isOrderLoading || (paymentMethod === 'coins' && isQuoteLoading)}
                    style={styles.submitBtn}
                />
            </View>

            {/* Paystack WebView Modal */}
            <Modal visible={!!paymentUrl} animationType="slide">
                <View style={{ flex: 1, paddingTop: 50 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16 }}>
                        <Button title="Cancel" variant="ghost" onPress={() => setPaymentUrl(null)} />
                    </View>
                    <WebView
                        source={{ uri: paymentUrl || '' }}
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
