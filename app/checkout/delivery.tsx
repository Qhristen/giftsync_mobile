import AddressPickerSheet from '@/components/sheets/AddressPickerSheet';
import DeliveryOptionsSheet from '@/components/sheets/DeliveryOptionsSheet';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useGetOccasionDetailQuery } from '@/store/api/occasionApi';
import { useCreateOrderMutation } from '@/store/api/orderApi';
import { useGetProductByIdQuery } from '@/store/api/productApi';
import { Address } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

export default function DeliveryScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const { occasionId, productId } = useLocalSearchParams<{ occasionId: string; productId: string }>();

    const { data: product, isLoading: isProductLoading } = useGetProductByIdQuery(productId as string, { skip: !productId });
    const { data: occasion, isLoading: isOccasionLoading } = useGetOccasionDetailQuery(occasionId as string, { skip: !occasionId });

    const [deliveryAddress, setDeliveryAddress] = React.useState<Address | null>(null);
    const [deliveryDate, setDeliveryDate] = React.useState<string | null>(null);
    const [deliveryTimeWindow, setDeliveryTimeWindow] = React.useState<'morning' | 'afternoon' | 'evening' | null>(null);
    const [giftMessage, setGiftMessage] = React.useState('');
    const [isAnonymous, setIsAnonymous] = React.useState(false);

    const addressSheet = useBottomSheet();
    const optionsSheet = useBottomSheet();
    const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

    const handleNext = async () => {
        if (!deliveryAddress || !deliveryDate || !deliveryTimeWindow) {
            alert('Please select an address, date, and time window.');
            return;
        }

        try {
            const timeWindowFormatted = deliveryTimeWindow.charAt(0).toUpperCase() + deliveryTimeWindow.slice(1);
            const result = await createOrder({
                productId: product?.id as string,
                occasionId: occasion?.id as string,
                deliveryAddressId: deliveryAddress.id as string,
                recipientName: deliveryAddress.recipientName,
                deliveryDate: deliveryDate,
                deliveryTimeWindow: timeWindowFormatted,
                giftMessage: giftMessage,
                anonymity: isAnonymous,
            }).unwrap();

            router.push({
                pathname: '/checkout/payment',
                params: { orderId: result.id }
            });
        } catch (error) {
            console.error('Failed to create order', error);
            alert('Failed to create order. Please try again.');
        }
    };

    const handleAddressSelect = (address: Address) => {
        setDeliveryAddress(address);
        addressSheet.close();
    };

    const handleOptionsSave = (date: string, timeWindow: 'morning' | 'afternoon' | 'evening') => {
        setDeliveryDate(date);
        setDeliveryTimeWindow(timeWindow);
        optionsSheet.close();
    };

    if (isProductLoading || isOccasionLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={"padding"}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={[styles.header, { padding: spacing.xl, paddingBottom: spacing.md }]}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </Pressable>
                    <Typography variant="h2">Delivery Details</Typography>
                </View>

                <ScrollView contentContainerStyle={[styles.content, { padding: spacing.xl }]}>
                    {/* Recipient Address */}
                    <Typography variant="label" style={{ marginBottom: spacing.sm }}>Recipient Address</Typography>
                    <Card variant="outline" style={styles.addressCard}>
                        <View style={styles.addressInfo}>
                            {deliveryAddress ? (
                                <>
                                    <Typography variant="bodyBold">{deliveryAddress.recipientName}</Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>
                                        {deliveryAddress.line1}{deliveryAddress.line2 ? `, ${deliveryAddress.line2}` : ''}, {deliveryAddress.city}, {deliveryAddress.state}, {deliveryAddress.country}. {deliveryAddress.phone}
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="body" color={colors.textMuted}>Select a delivery address</Typography>
                            )}
                        </View>
                        <Button title={deliveryAddress ? "Change" : "Select"} size="sm" variant="ghost" onPress={() => addressSheet.open()} />
                    </Card>

                    {/* Delivery Options */}
                    <Typography variant="label" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Delivery Preference</Typography>
                    <Card variant="outline" onPress={() => optionsSheet.open()} style={styles.optionsCard}>
                        <View style={styles.optionRow}>
                            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                            <Typography variant="body" style={{ flex: 1 }}>Delivery Date</Typography>
                            <Typography variant="bodyBold" color={colors.primary}>
                                {deliveryDate ? deliveryDate : 'Select Date'}
                            </Typography>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.optionRow}>
                            <Ionicons name="time-outline" size={20} color={colors.primary} />
                            <Typography variant="body" style={{ flex: 1 }}>Time Window</Typography>
                            <Typography variant="bodyBold" color={colors.primary} style={{ textTransform: 'capitalize' }}>
                                {deliveryTimeWindow ? deliveryTimeWindow : 'Select Time'}
                            </Typography>
                        </View>
                    </Card>

                    {/* Premium Packaging */}
                    <Card variant="raised" style={[styles.packagingCard, { marginTop: spacing.xl }]}>
                        <View style={{ flex: 1 }}>
                            <Typography variant="bodyBold">Premium Packaging</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Ribbon-wrapped box + Silk paper (+ NGN {(Number(product?.packagingFee || 500)).toLocaleString()})</Typography>
                        </View>
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    </Card>

                    {/* Gift Message */}
                    <Typography variant="label" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Personal Message</Typography>
                    <Input
                        value={giftMessage}
                        onChangeText={setGiftMessage}
                        placeholder="Add a heartfelt message for the recipient..."
                        multiline
                        numberOfLines={4}
                        style={{ minHeight: 100 }}
                    />

                    {/* Anonymous Delivery */}
                    <Card variant="raised" style={[styles.packagingCard, { marginTop: spacing.xl }]}>
                        <View style={{ flex: 1, paddingRight: spacing.md }}>
                            <Typography variant="bodyBold">Send Anonymously</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Keep your identity a secret from the recipient</Typography>
                        </View>
                        <Switch
                            value={isAnonymous}
                            onValueChange={setIsAnonymous}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor={colors.background}
                        />
                    </Card>

                    {/* Summary Mini */}
                    <Card variant="raised" style={{ marginTop: 40, padding: 16 }}>
                        <View style={styles.summaryRow}>
                            <Typography variant="caption">{product?.name || 'Item'} Subtotal</Typography>
                            <Typography variant="caption">NGN {product?.price?.toLocaleString() || '---'}</Typography>
                        </View>
                        <View style={styles.summaryRow}>
                            <Typography variant="caption">Delivery Fee</Typography>
                            <Typography variant="caption">NGN {(Number(product?.deliveryFee || 1500)).toLocaleString()}</Typography>
                        </View>
                        <View style={styles.summaryRow}>
                            <Typography variant="caption">Packaging</Typography>
                            <Typography variant="caption">NGN {(Number(product?.packagingFee || 500)).toLocaleString()}</Typography>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 8 }]} />
                        <View style={styles.summaryRow}>
                            <Typography variant="bodyBold">Estimated Total</Typography>
                            <Typography variant="bodyBold" color={colors.primary}>
                                NGN {((Number(product?.price || 0) + Number(product?.deliveryFee || 1500) + Number(product?.packagingFee || 500)) || 0).toLocaleString()}
                            </Typography>
                        </View>
                    </Card>
                </ScrollView>

                {/* Footer CTA */}
                <View style={[styles.footer, { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Button
                        title="Continue to Payment →"
                        onPress={handleNext}
                        isLoading={isCreating}
                        style={styles.submitBtn}
                    />
                </View>

                {/* Sheets */}
                <AddressPickerSheet
                    ref={addressSheet.ref}
                    selectedAddressId={deliveryAddress?.id}
                    onSelect={handleAddressSelect}
                />
                <DeliveryOptionsSheet
                    ref={optionsSheet.ref}
                    initialDate={deliveryDate}
                    initialTimeWindow={deliveryTimeWindow}
                    onSave={handleOptionsSave}
                />
            </KeyboardAvoidingView>
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
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    addressInfo: {
        flex: 1,
    },
    optionsCard: {
        padding: 0,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.1,
    },
    packagingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    messageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        minHeight: 80,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    footer: {
        width: '100%',
    },
    submitBtn: {
        width: '100%',
    },
});
