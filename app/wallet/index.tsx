import PaymentMethodSheet from '@/components/sheets/PaymentMethodSheet';
import ListSkeleton from '@/components/skeletons/ListSkeleton';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { useGetCoinPackagesQuery, useGetWalletBalanceQuery, useInitializeFundingMutation, useVerifyFundingMutation } from '@/store/api/walletApi';
import { CoinPackage } from '@/types';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import { useSelector } from 'react-redux';
import { toast } from 'sonner-native';

const packageStyles: Record<number, { icon: string; color: string }> = {
    0: { icon: 'star-outline', color: '#10B981' },
    1: { icon: 'flash-outline', color: '#3B82F6' },
    2: { icon: 'diamond-outline', color: '#8B5CF6' },
    3: { icon: 'rocket-outline', color: '#EF4444' },
};

const getPackageStyle = (index: number) => packageStyles[index % 4];

export default function WalletTopUpScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const coins = useSelector((state: RootState) => state.wallet.coins);

    const { data: coinPackages = [], isLoading, isFetching: isFetchingPackages, refetch: refetchPackages } = useGetCoinPackagesQuery();
    const { data: wallet, refetch: refetchWallet, isFetching: isFetchingWallet } = useGetWalletBalanceQuery();

    const isRefreshing = isFetchingPackages || isFetchingWallet;
    const handleRefresh = () => { refetchPackages(); refetchWallet(); };

    const [initializeFunding] = useInitializeFundingMutation();
    const [verifyFunding] = useVerifyFundingMutation();

    const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('paystack');
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const paymentReferenceRef = useRef<string | null>(null);
    const paymentSheet = useBottomSheet();

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: currency || 'NGN',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handlePurchase = async () => {
        if (!selectedPackage || !selectedPaymentMethod) return;

        setIsPurchasing(true);

        try {
            const response = await initializeFunding({
                amount: Number(selectedPackage.price),
                paymentType: 'deposit',
                packageId: selectedPackage.id,
            }).unwrap();

            // Store reference for later verification
            paymentReferenceRef.current = response.data.reference;

            // Close the payment method sheet first
            paymentSheet.close();

            // Open Paystack checkout in a WebView
            setPaymentUrl(response.data.authorizationUrl);
        } catch (error: any) {
            console.error('Payment initialization error:', error);
            toast.error(error?.data?.message || 'Failed to initialize payment. Please try again.');
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleVerifyPayment = async () => {
        const reference = paymentReferenceRef.current;
        if (!reference) return;

        try {
            const result = await verifyFunding({ reference }).unwrap();

            // Refetch wallet balance to reflect new coins
            refetchWallet();

            toast.success('Deposit Successful!', {
                description: result.message || `Your wallet has been credited.`,
                action: {
                    label: 'Great',
                    onClick: () => router.back()
                }
            });
        } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error(error?.data?.message || 'Payment verification failed. If you were charged, your wallet will be credited shortly.');
        } finally {
            paymentReferenceRef.current = null;
        }
    };

    const handleWebViewNavChange = (newNavState: any) => {
        const { url } = newNavState;
        if (!url) return;

        // Detect Paystack callback/success/cancel URLs
        if (url.includes('success') || url.includes('callback') || url.includes('trxref')) {
            setPaymentUrl(null);
            handleVerifyPayment();
        }

        if (url.includes('cancel') || url.includes('fail')) {
            setPaymentUrl(null);
            paymentReferenceRef.current = null;
            toast.error('Payment cancelled or failed.');
        }
    };

    const handleCancelPayment = () => {
        setPaymentUrl(null);
        paymentReferenceRef.current = null;
        toast('Payment cancelled');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h3">Top Up Wallet</Typography>
                <View style={{ width: 40 }} />
            </View>

            {/* Current Balance */}
            <Animated.View entering={FadeInDown.duration(400)} style={[styles.balanceSection, { padding: spacing.xl }]}>
                <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
                    <FontAwesome5 name="coins" size={32} color="rgba(255,255,255,0.8)" style={{ marginBottom: 12 }} />
                    <Typography variant="caption" color="rgba(255,255,255,0.8)" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Current Balance
                    </Typography>
                    <Typography variant="h1" color="#FFF" style={{ marginTop: 4 }}>
                        {wallet?.balance.toLocaleString()} <Typography variant="h3" color="rgba(255,255,255,0.8)">Coins</Typography>
                    </Typography>
                </Card>
            </Animated.View>

            {/* Transaction History Link */}
            <Pressable
                onPress={() => router.push('/wallet/transactions' as any)}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: spacing.md }}
            >
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Typography variant="label" color={colors.primary}>Transaction History →</Typography>
            </Pressable>

            {/* Packages */}
            <View style={{ flex: 1 }}>
                {isLoading ? (
                    <View style={{ flex: 1, paddingTop: 20 }}>
                        <ListSkeleton />
                    </View>
                ) : (
                    <FlashList
                        data={coinPackages}
                        keyExtractor={(item) => String(item.id)}
                        showsVerticalScrollIndicator={false}
                        onRefresh={handleRefresh}
                        refreshing={isRefreshing}
                        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 150 }}
                        ListHeaderComponent={
                            <Typography variant="h4" style={{ marginBottom: spacing.md, marginTop: spacing.xs }}>
                                Select Package
                            </Typography>
                        }
                        renderItem={({ item, index }) => {
                            const isSelected = selectedPackage?.id === item.id;
                            const style = getPackageStyle(index);
                            const isPopular = item.isPopular;

                            return (
                                <Animated.View entering={FadeInDown.delay(index * 100 + 200).duration(400)}>
                                    <Card
                                        onPress={() => setSelectedPackage(item)}
                                        style={[
                                            styles.packageCard,
                                            {
                                                borderColor: isSelected ? colors.primary : 'transparent',
                                                borderWidth: 2,
                                                backgroundColor: colors.surface,
                                                marginBottom: spacing.md,
                                            }
                                        ]}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: style.color + '1A' }]}>
                                            <Ionicons name={style.icon as any} size={24} color={style.color} />
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 16 }}>
                                            <Typography variant="bodyBold">{item.coinAmount} Coins</Typography>
                                            <Typography variant="caption" color={colors.textSecondary}>{item.label}</Typography>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Typography variant="label" color={colors.primary}>
                                                {formatPrice(item.price, item.currency)}
                                            </Typography>
                                            {isPopular && (
                                                <View style={[styles.popularBadge, { backgroundColor: '#F59E0B20' }]}>
                                                    <Typography variant="caption" color="#D97706" style={{ fontSize: 10, fontFamily: 'DMSans_700Bold' }}>
                                                        POPULAR
                                                    </Typography>
                                                </View>
                                            )}
                                        </View>
                                    </Card>
                                </Animated.View>
                            );
                        }}
                    />
                )}
            </View>

            {/* Footer */}
            <View pointerEvents="box-none" style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <Button
                    title={selectedPackage ? `Pay ${formatPrice(selectedPackage.price, selectedPackage.currency)}` : 'Select a package'}
                    variant="primary"
                    disabled={!selectedPackage}
                    onPress={() => paymentSheet.open()}
                />
            </View>

            {/* Payment Method Sheet */}
            <PaymentMethodSheet
                ref={paymentSheet.ref}
                selectedMethod={selectedPaymentMethod}
                onSelectMethod={setSelectedPaymentMethod}
                onConfirm={handlePurchase}
                confirmButtonText={selectedPackage ? `Confirm ${formatPrice(selectedPackage.price, selectedPackage.currency)}` : 'Confirm Purchase'}
                isProcessing={isPurchasing}
            />

            {/* Paystack WebView Modal */}
            <Modal visible={!!paymentUrl} animationType="slide" onRequestClose={handleCancelPayment}>
                <View style={[styles.webviewContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.webviewHeader}>
                        <Button title="Cancel" variant="ghost" onPress={handleCancelPayment} />
                        <Typography variant="label">Complete Payment</Typography>
                        <View style={{ width: 80 }} />
                    </View>
                    <WebView
                        source={{ uri: paymentUrl || '' }}
                        onNavigationStateChange={handleWebViewNavChange}
                        startInLoadingState={true}
                        style={{ flex: 1 }}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    balanceSection: {
        alignItems: 'center',
    },
    balanceCard: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 32,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    packageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    popularBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 24,
    },
    webviewContainer: {
        flex: 1,
        paddingTop: 50,
    },
    webviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
});
