import PaymentMethodSheet, { PAYMENT_METHODS } from '@/components/sheets/PaymentMethodSheet';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { addCoins } from '@/store/slices/walletSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner-native';

const COIN_PACKAGES = [
    { id: '1', amount: 10, price: 'NGN 1,000', label: 'Starter', icon: 'star-outline', color: '#10B981' },
    { id: '2', amount: 50, price: 'NGN 4,500', label: 'Value', icon: 'flash-outline', color: '#3B82F6', popular: true },
    { id: '3', amount: 100, price: 'NGN 8,000', label: 'Pro', icon: 'diamond-outline', color: '#8B5CF6' },
    { id: '4', amount: 500, price: 'NGN 35,000', label: 'Ultimate', icon: 'rocket-outline', color: '#EF4444' },
];

export default function WalletTopUpScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const dispatch = useDispatch();
    const coins = useSelector((state: RootState) => state.wallet.coins);

    const [selectedPackage, setSelectedPackage] = useState<typeof COIN_PACKAGES[0] | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('paystack');
    const [isPurchasing, setIsPurchasing] = useState(false);
    const paymentSheet = useBottomSheet();

    const handlePurchase = () => {
        if (!selectedPackage || !selectedPaymentMethod) return;

        const paymentName = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name;

        setIsPurchasing(true);
        // Simulate network call
        setTimeout(() => {
            dispatch(addCoins(selectedPackage.amount));
            setIsPurchasing(false);
            paymentSheet.close();
            toast.success('Success!', {
                description: `You have successfully purchased ${selectedPackage.amount} Coins via ${paymentName}!`,
                action: {
                    label: 'Great',
                    onClick: () => router.back()
                }
            });
        }, 1500);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingBottom: spacing.md }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h3">Top Up Wallet</Typography>
                <View style={{ width: 40 }} />
            </View>

            {/* Current Balance */}
            <Animated.View entering={FadeInDown.duration(400)} style={[styles.balanceSection, { padding: spacing.xl }]}>
                <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
                    <Ionicons name="wallet" size={32} color="rgba(255,255,255,0.8)" style={{ marginBottom: 12 }} />
                    <Typography variant="caption" color="rgba(255,255,255,0.8)" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        Current Balance
                    </Typography>
                    <Typography variant="h1" color="#FFF" style={{ marginTop: 4 }}>
                        {coins} <Typography variant="h3" color="rgba(255,255,255,0.8)">Coins</Typography>
                    </Typography>
                </Card>
            </Animated.View>

            {/* Packages */}
            <FlatList
                data={COIN_PACKAGES}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 100 }}
                ListHeaderComponent={
                    <Typography variant="h4" style={{ marginBottom: spacing.md, marginTop: spacing.xs }}>
                        Select Package
                    </Typography>
                }
                renderItem={({ item, index }) => {
                    const isSelected = selectedPackage?.id === item.id;
                    return (
                        <Animated.View entering={FadeInDown.delay(index * 100 + 200).duration(400)}>
                            <Pressable onPress={() => setSelectedPackage(item)}>
                                <Card
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
                                    <View style={[styles.iconBox, { backgroundColor: item.color + '1A' }]}>
                                        <Ionicons name={item.icon as any} size={24} color={item.color} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                        <Typography variant="bodyBold">{item.amount} Coins</Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>{item.label} Pack</Typography>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Typography variant="label" color={colors.primary}>{item.price}</Typography>
                                        {item.popular && (
                                            <View style={[styles.popularBadge, { backgroundColor: '#F59E0B20' }]}>
                                                <Typography variant="caption" color="#D97706" style={{ fontSize: 10, fontFamily: 'DMSans_700Bold' }}>
                                                    POPULAR
                                                </Typography>
                                            </View>
                                        )}
                                    </View>
                                </Card>
                            </Pressable>
                        </Animated.View>
                    );
                }}
            />

            {/* Footer */}
            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <Button
                    title={selectedPackage ? `Pay ${selectedPackage.price}` : 'Select a package'}
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
                confirmButtonText={selectedPackage ? `Confirm ${selectedPackage.price}` : 'Confirm Purchase'}
                isProcessing={isPurchasing}
            />
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
        borderRadius: 24,
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
        // borderTopWidth: 1,
    },
});
