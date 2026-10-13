import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import CheckoutSkeleton from '@/components/skeletons/CheckoutSkeleton';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useValidateCouponMutation } from '@/store/api/couponApi';
import { useGetOrderByIdQuery, useHandlePaymentMutation } from '@/store/api/orderApi';
import { useGetCoinQuoteQuery, useGetWalletBalanceQuery } from '@/store/api/walletApi';
import { ValidateCouponResponse } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { CreditCardIcon, Delete02Icon, Money01Icon, Tag01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { toast } from 'sonner-native';

type PaymentChoice = 'coins' | 'paystack';

export default function PaymentScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const { data: order, isLoading: isOrderLoading } = useGetOrderByIdQuery(orderId as string, { skip: !orderId });
    const [handlePayment] = useHandlePaymentMutation();
    const { data: wallet } = useGetWalletBalanceQuery();
    const insets = useSafeAreaInsets();

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResponse | null>(null);
    const [validateCoupon, { isLoading: isValidating }] = useValidateCouponMutation();
    const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>('coins');
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const payableTotal = (order?.total ?? 0) - (appliedCoupon?.discountAmount ?? 0);
    const currency = order?.item?.product.currency;
    const { data: coinQuote, isLoading: isQuoteLoading } = useGetCoinQuoteQuery(
        { amount: payableTotal, currency },
        { skip: !order?.total },
    );

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        try {
            const result = await validateCoupon({
                code: couponCode.trim(),
                orderAmount: Number(order?.total) || 0,
                businessId: order?.businessId as string,
            }).unwrap();
            setAppliedCoupon(result);
            toast.success('Coupon clipped!', {
                description: `You saved ${formatCurrency(result.discountAmount, currency)}`,
            });
        } catch (error: any) {
            console.error('Coupon Error:', error);
            toast.error(error?.data?.message || 'That coupon could not be used.');
            setAppliedCoupon(null);
        }
    };

    const handlePay = async () => {
        try {
            setIsProcessing(true);
            const response = await handlePayment({
                orderId: order?.id as string,
                method: paymentMethod,
                couponCode: appliedCoupon?.coupon.code,
            }).unwrap();

            if (response.paymentMethod === 'paystack' && response.status === 'payment_initiated') {
                setPaymentUrl(response.checkoutUrl as string);
            } else if (response.status === 'paid') {
                router.replace({ pathname: '/checkout/confirmation', params: { orderId } });
            }
        } catch (error: any) {
            console.error('Payment Error:', error);
            toast.error(error?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWebViewStateChange = ({ url }: { url?: string }) => {
        if (!url) return;
        if (url.includes('success') || url.includes('callback') || url.includes('trxref')) {
            setPaymentUrl(null);
            router.replace({ pathname: '/checkout/confirmation', params: { orderId } });
            toast.success('Payment successful!', { description: 'Your gift is ready for dispatch.' });
        } else if (url.includes('cancel') || url.includes('fail')) {
            setPaymentUrl(null);
            toast.error('Payment was cancelled.');
        }
    };

    if (isOrderLoading) {
        return <CheckoutSkeleton step={3} onBack={() => router.back()} />;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CheckoutProgress
                step={3}
                eyebrow="Checkout till"
                title="Choose how to pay"
                onBack={() => router.back()}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={[styles.orderTicket, { backgroundColor: colors.lemon, borderColor: colors.ink, shadowColor: colors.ink }]}>
                    <View style={styles.orderTopLine}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>GIFT TILL · READY TO CHECK OUT</Typography>
                        <View style={[styles.orderStamp, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <Typography variant="caption" style={styles.stampCopy}>#{order?.id?.slice(-6).toUpperCase()}</Typography>
                        </View>
                    </View>
                    <View style={styles.productRow}>
                        {order?.item?.product.imageUrls?.[0] ? (
                            <Image source={{ uri: order.item.product.imageUrls[0] }} style={styles.productImage} contentFit="cover" />
                        ) : (
                            <View style={[styles.productImage, { backgroundColor: colors.lavender }]} />
                        )}
                        <View style={styles.productCopy}>
                            <Typography variant="h4" numberOfLines={2}>{order?.item?.product.name || order?.item?.productName || 'A thoughtful gift'}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>For {order?.recipientName || 'someone special'}</Typography>
                        </View>
                        <Typography variant="bodyBold">{formatCurrency(order?.total ?? 0, currency)}</Typography>
                    </View>
                </View>

                <View style={styles.sectionHeading}>
                    <Typography variant="label">Choose a wallet</Typography>
                    <Typography variant="caption" color={colors.textSecondary}>TAP ONE</Typography>
                </View>
                <View style={styles.methodStack}>
                    <PaymentPass
                        active={paymentMethod === 'coins'}
                        color={colors.lavender}
                        icon={<HugeiconsIcon icon={Money01Icon} size={25} color={colors.ink} />}
                        title="GiftSync coins"
                        detail={`${wallet?.balance?.toLocaleString() ?? '0'} coins available`}
                        onPress={() => setPaymentMethod('coins')}
                    />
                    <PaymentPass
                        active={paymentMethod === 'paystack'}
                        color={colors.sky}
                        icon={<HugeiconsIcon icon={CreditCardIcon} size={25} color={colors.ink} />}
                        title="Bank card"
                        detail="Secure checkout powered by Paystack"
                        onPress={() => setPaymentMethod('paystack')}
                    />
                </View>

                <View style={styles.sectionHeading}>
                    <Typography variant="label">Clip a coupon</Typography>
                    <Typography variant="caption" color={colors.textSecondary}>OPTIONAL</Typography>
                </View>
                {!appliedCoupon ? (
                    <View style={[styles.couponTicket, { backgroundColor: colors.peach, borderColor: colors.ink }]}>
                        <View style={[styles.couponIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={Tag01Icon} size={21} color={colors.ink} />
                        </View>
                        <Input
                            placeholder="COUPON CODE"
                            value={couponCode}
                            onChangeText={setCouponCode}
                            autoCapitalize="characters"
                            style={styles.couponInput}
                        />
                        <Button
                            title="Clip"
                            size="sm"
                            onPress={handleApplyCoupon}
                            isLoading={isValidating}
                            disabled={!couponCode.trim()}
                            style={styles.clipButton}
                        />
                    </View>
                ) : (
                    <View style={[styles.appliedCoupon, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                        <View style={[styles.couponIcon, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={Tick01Icon} size={20} color={colors.ink} />
                        </View>
                        <View style={styles.productCopy}>
                            <Typography variant="bodyBold">{appliedCoupon.coupon.code}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>
                                {formatCurrency(appliedCoupon.discountAmount, currency)} trimmed off the total
                            </Typography>
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Remove coupon"
                            onPress={() => { setAppliedCoupon(null); setCouponCode(''); }}
                            style={({ pressed }) => [styles.removeCoupon, { opacity: pressed ? 0.55 : 1 }]}
                        >
                            <HugeiconsIcon icon={Delete02Icon} size={21} color={colors.error} />
                        </Pressable>
                    </View>
                )}

                <View style={[styles.receipt, { backgroundColor: colors.surface, borderColor: colors.ink, shadowColor: colors.ink }]}>
                    <View style={styles.receiptHeading}>
                        <Typography variant="label">Final receipt</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>GS · {new Date().getFullYear()}</Typography>
                    </View>
                    <View style={[styles.dashedLine, { borderColor: colors.textMuted }]} />
                    <ReceiptRow label="Gift subtotal" value={formatCurrency(order?.subtotal ?? 0, currency)} />
                    <ReceiptRow label="Delivery" value={formatCurrency(order?.deliveryFee ?? 0, currency)} />
                    <ReceiptRow label="Gift wrapping" value={formatCurrency(order?.packagingFee ?? 0, currency)} />
                    {appliedCoupon ? (
                        <ReceiptRow
                            label={`Coupon · ${appliedCoupon.coupon.code}`}
                            value={`-${formatCurrency(appliedCoupon.discountAmount, currency)}`}
                            accent
                        />
                    ) : null}
                    <View style={[styles.dashedLine, { borderColor: colors.textMuted }]} />
                    <View style={styles.totalRow}>
                        <View>
                            <Typography variant="caption" color={colors.textSecondary}>TOTAL DUE</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>
                                {paymentMethod === 'coins' ? `${coinQuote?.coins?.toLocaleString() ?? '…'} GiftSync coins` : 'Charged securely by card'}
                            </Typography>
                        </View>
                        <Typography variant="h2">{formatCurrency(payableTotal, currency)}</Typography>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
                <Button
                    title={paymentMethod === 'coins'
                        ? `Send ${coinQuote?.coins?.toLocaleString() ?? '…'} coins  →`
                        : `Pay ${formatCurrency(payableTotal, currency)}  →`}
                    onPress={handlePay}
                    isLoading={isProcessing || (paymentMethod === 'coins' && isQuoteLoading)}
                    disabled={!order}
                    style={styles.submitButton}
                />
            </View>

            <Modal visible={!!paymentUrl} animationType="slide" presentationStyle="pageSheet">
                <View style={[styles.webViewShell, { backgroundColor: colors.background, paddingTop: insets.top + 12 }]}>
                    <View style={[styles.webViewHeader, { borderColor: colors.ink }]}>
                        <View>
                            <Typography variant="caption" color={colors.textSecondary}>SECURE CHECKOUT</Typography>
                            <Typography variant="h3">Complete card payment</Typography>
                        </View>
                        <Button title="Close" variant="outline" size="sm" onPress={() => setPaymentUrl(null)} />
                    </View>
                    <View style={[styles.webViewFrame, { borderColor: colors.ink }]}>
                        <WebView
                            source={{ uri: paymentUrl || '' }}
                            javaScriptEnabled
                            domStorageEnabled
                            originWhitelist={['*']}
                            onNavigationStateChange={handleWebViewStateChange}
                            startInLoadingState
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function PaymentPass({ active, color, icon, title, detail, onPress }: {
    active: boolean;
    color: string;
    icon: React.ReactNode;
    title: string;
    detail: string;
    onPress: () => void;
}) {
    const { colors } = useTheme();
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.paymentPass,
                {
                    backgroundColor: color,
                    borderColor: colors.ink,
                    shadowColor: active ? colors.ink : 'transparent',
                    opacity: pressed ? 0.72 : 1,
                    transform: [{ rotate: active ? '-0.7deg' : '0deg' }],
                },
            ]}
        >
            <View style={[styles.methodIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>{icon}</View>
            <View style={styles.productCopy}>
                <Typography variant="bodyBold">{title}</Typography>
                <Typography variant="caption" color={colors.textSecondary}>{detail}</Typography>
            </View>
            <View style={[styles.choiceDot, { backgroundColor: active ? colors.lime : colors.surface, borderColor: colors.ink }]}>
                {active ? <Typography variant="caption" style={styles.stampCopy}>✓</Typography> : null}
            </View>
        </Pressable>
    );
}

function ReceiptRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
    const { colors } = useTheme();
    return (
        <View style={styles.receiptRow}>
            <Typography variant="body" color={accent ? colors.success : colors.textSecondary}>{label}</Typography>
            <Typography variant="bodyBold" color={accent ? colors.success : colors.textPrimary}>{value}</Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 136, gap: 18 },
    orderTicket: {
        borderWidth: 1.5,
        borderRadius: 24,
        padding: 17,
        gap: 15,
        shadowOffset: { width: 4, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 0,
        elevation: 3,
        transform: [{ rotate: '0.5deg' }],
    },
    orderTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
    overline: { flex: 1, fontWeight: '700', letterSpacing: 1 },
    orderStamp: { borderWidth: 1.5, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5, transform: [{ rotate: '3deg' }] },
    stampCopy: { fontWeight: '800' },
    productRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    productImage: { width: 68, height: 68, borderRadius: 15 },
    productCopy: { flex: 1 },
    sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 },
    methodStack: { gap: 12 },
    paymentPass: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1.5,
        borderRadius: 21,
        padding: 15,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
    },
    methodIcon: { width: 48, height: 48, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    choiceDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    couponTicket: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 20, padding: 10, borderStyle: 'dashed' },
    couponIcon: { width: 42, height: 42, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    couponInput: { flex: 1 },
    clipButton: { minHeight: 56, paddingHorizontal: 16 },
    appliedCoupon: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1.5, borderRadius: 20, padding: 13, borderStyle: 'dashed' },
    removeCoupon: { padding: 7 },
    receipt: {
        borderWidth: 1.5,
        borderRadius: 22,
        padding: 18,
        gap: 11,
        shadowOffset: { width: 3, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 0,
        transform: [{ rotate: '-0.4deg' }],
    },
    receiptHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dashedLine: { borderTopWidth: 1, borderStyle: 'dashed', marginVertical: 3 },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
    totalRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
    footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 14 },
    submitButton: { width: '100%' },
    webViewShell: { flex: 1, paddingHorizontal: 14, paddingBottom: 14, gap: 14 },
    webViewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 12, borderBottomWidth: 1.5 },
    webViewFrame: { flex: 1, overflow: 'hidden', borderWidth: 1.5, borderRadius: 22 },
});
