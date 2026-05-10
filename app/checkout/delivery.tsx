import AddressPickerSheet from '@/components/sheets/AddressPickerSheet';
import DeliveryOptionsSheet from '@/components/sheets/DeliveryOptionsSheet';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';
import { useTheme } from '@/hooks/useTheme';
import { useGetOccasionDetailQuery } from '@/store/api/occasionApi';
import { useCreateOrderMutation } from '@/store/api/orderApi';
import { useGetProductByIdQuery } from '@/store/api/productApi';
import { Address } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { addDays, format, startOfDay, subDays } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function DeliveryScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const { deliveryFeeNgn, packagingFeeNgn } = usePlatformConfig();
    const { occasionId, productId } = useLocalSearchParams<{ occasionId: string; productId: string }>();
   const insets = useSafeAreaInsets();
    const { data: product, isLoading: initialProductLoading, isFetching: isProductFetching } = useGetProductByIdQuery(productId as string, { skip: !productId });
    const isProductLoading = initialProductLoading || isProductFetching;

    const { data: occasion, isLoading: initialOccasionLoading, isFetching: isOccasionFetching } = useGetOccasionDetailQuery(occasionId as string, { skip: !occasionId });
    const isOccasionLoading = initialOccasionLoading || isOccasionFetching;

    const [deliveryAddress, setDeliveryAddress] = React.useState<Address | null>(null);
    const [deliveryDate, setDeliveryDate] = React.useState<string | null>(null);
    const [deliveryTimeWindow, setDeliveryTimeWindow] = React.useState<'morning' | 'afternoon' | 'evening' | null>(null);
    const [giftMessage, setGiftMessage] = React.useState('');
    const [isAnonymous, setIsAnonymous] = React.useState(false);

    const addressSheet = useBottomSheet();
    const optionsSheet = useBottomSheet();
    const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

    const [showDatePicker, setShowDatePicker] = React.useState(false);

    const maxDate = useMemo(() => {
        if (!occasion?.date) return addDays(new Date(), 14);
        return subDays(startOfDay(new Date(occasion.date)), 1);
    }, [occasion?.date]);

    const minDate = useMemo(() => startOfDay(new Date()), []);

    // Set initial date if not set
    React.useEffect(() => {
        if (!deliveryDate && occasion) {
            const today = startOfDay(new Date());
            if (today <= maxDate) {
                setDeliveryDate(format(today, 'yyyy-MM-dd'));
            } else {
                setDeliveryDate(format(maxDate, 'yyyy-MM-dd'));
            }
        }
    }, [deliveryDate, maxDate, occasion]);

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDeliveryDate(format(selectedDate, 'yyyy-MM-dd'));
        }
    };

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
                recipientName: occasion?.contact?.name as string,
                deliveryDate: deliveryDate,
                deliveryTimeWindow: timeWindowFormatted,
                giftMessage: giftMessage,
                anonymity: isAnonymous,
                quantity: 1
            }).unwrap();

            router.push({
                pathname: '/checkout/payment',
                params: { orderId: result.id }
            });
        } catch (error: any) {
            console.error('Failed to create order', error);
            toast.error(error?.data?.message || 'Failed to create order. Please try again.');
        }
    };

    const handleAddressSelect = (address: Address) => {
        setDeliveryAddress(address);
        addressSheet.close();
    };

    const handleOptionsSave = (timeWindow: 'morning' | 'afternoon' | 'evening') => {
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
                <View style={[styles.header, { padding: spacing.xl, paddingBottom: spacing.md, paddingTop: insets.top }]}>
                    <Pressable onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </Pressable>
                    <Typography variant="h2">Delivery Details</Typography>
                </View>

                <ScrollView contentContainerStyle={[styles.content, { padding: spacing.xl }]} showsVerticalScrollIndicator={false}>
                    {/* Recipient Overview */}
                    <View style={styles.recipientHeader}>
                        <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '10' }]}>
                            <Ionicons name="person" size={24} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Typography variant="bodyBold">{occasion?.contact?.name || 'Someone Special'}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Recipient for {occasion?.title || 'this occasion'}</Typography>
                        </View>
                        <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
                            <Typography variant="caption" color={colors.primary} style={{ fontWeight: 'bold' }}>GIFTING</Typography>
                        </View>
                    </View>

                    {/* Logistics Section */}
                    <View style={styles.section}>
                        <Typography variant="label" style={styles.sectionLabel}>Where & When</Typography>
                        
                        <Card variant="outline" style={styles.detailCard}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="location-outline" size={18} color={colors.textMuted} />
                                <Typography variant="caption" style={{ fontWeight: 'bold', marginLeft: 8 }}>DELIVERY ADDRESS</Typography>
                            </View>
                            <View style={styles.cardMain}>
                                {deliveryAddress ? (
                                    <View style={styles.addressInfo}>
                                        <Typography variant="bodyBold">{deliveryAddress.recipientName}</Typography>
                                        <Typography variant="caption" color={colors.textSecondary} numberOfLines={2}>
                                            {deliveryAddress.line1}, {deliveryAddress.city}, {deliveryAddress.state}
                                        </Typography>
                                    </View>
                                ) : (
                                    <Typography variant="body" color={colors.textMuted}>Choose where to send your gift</Typography>
                                )}
                                <Button title={deliveryAddress ? "Edit" : "Select"} size="sm" variant="ghost" onPress={() => addressSheet.open()} />
                            </View>
                        </Card>

                        <View style={styles.row}>
                            <Card variant="outline" style={[styles.detailCard, { flex: 1, marginBottom: 0 }]} onPress={() => setShowDatePicker(true)}>
                                <View style={styles.cardHeader}>
                                    <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
                                    <Typography variant="caption" style={{ fontWeight: 'bold', marginLeft: 8 }}>DATE</Typography>
                                </View>
                                <Typography variant="bodyBold" color={colors.primary} style={{ marginTop: 8 }}>
                                    {deliveryDate ? format(new Date(deliveryDate), 'MMM d, yyyy') : 'Select Date'}
                                </Typography>
                            </Card>

                            <Card variant="outline" style={[styles.detailCard, { flex: 1, marginBottom: 0 }]} onPress={() => optionsSheet.open()}>
                                <View style={styles.cardHeader}>
                                    <Ionicons name="time-outline" size={18} color={colors.textMuted} />
                                    <Typography variant="caption" style={{ fontWeight: 'bold', marginLeft: 8 }}>TIME</Typography>
                                </View>
                                <Typography variant="bodyBold" color={colors.primary} style={{ marginTop: 8, textTransform: 'capitalize' }}>
                                    {deliveryTimeWindow ? deliveryTimeWindow : 'Set Time'}
                                </Typography>
                            </Card>
                        </View>
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            value={deliveryDate ? new Date(deliveryDate) : new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                            minimumDate={minDate}
                            maximumDate={maxDate}
                        />
                    )}

                    {/* Personalization Section */}
                    <View style={styles.section}>
                        <Typography variant="label" style={styles.sectionLabel}>Make it Special</Typography>

                        <Card variant="outline" style={styles.packagingCard}>
                            <View style={styles.packagingIcon}>
                                <Ionicons name="gift-outline" size={24} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Typography variant="bodyBold">Premium Packaging</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>Ribbon-wrapped box + Silk paper</Typography>
                            </View>
                            <View style={[styles.miniBadge, { backgroundColor: colors.success + '15' }]}>
                                <Typography variant="caption" color={colors.success} style={{ fontWeight: 'bold', fontSize: 10 }}>INCLUDED</Typography>
                            </View>
                        </Card>

                        <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.md, marginBottom: spacing.xs }}>Gift Message</Typography>
                        <Input
                            value={giftMessage}
                            onChangeText={setGiftMessage}
                            placeholder="Add a heartfelt message for the recipient..."
                            multiline
                            numberOfLines={4}
                            style={{ minHeight: 120, borderRadius: 20 }}
                        />

                        <Card variant="outline" style={[styles.toggleCard, { marginTop: spacing.md }]}>
                            <View style={{ flex: 1, paddingRight: spacing.md }}>
                                <Typography variant="bodyBold">Send Anonymously</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>Hide your identity from the recipient</Typography>
                            </View>
                            <Switch
                                value={isAnonymous}
                                onValueChange={setIsAnonymous}
                                trackColor={{ false: colors.border, true: colors.primary }}
                                thumbColor={colors.background}
                            />
                        </Card>
                    </View>

                    {/* Summary Mini */}
                    <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Typography variant="bodyBold" style={{ marginBottom: spacing.md }}>Order Summary</Typography>
                        {/* <View style={styles.summaryRow}>
                            <Typography variant="caption" color={colors.textSecondary}>Item Price</Typography>
                            <Typography variant="caption">{formatCurrency(product?.price || 0, product?.currency || 'NGN')}</Typography>
                        </View> */}
                        {/* <View style={styles.summaryRow}>
                            <Typography variant="caption" color={colors.textSecondary}>Delivery Fee</Typography>
                            <Typography variant="caption">{formatCurrency(product?.deliveryFee || deliveryFeeNgn, product?.currency || 'NGN')}</Typography>
                        </View>
                        <View style={styles.summaryRow}>
                            <Typography variant="caption" color={colors.textSecondary}>Packaging</Typography>
                            <Typography variant="caption">{formatCurrency(product?.packagingFee || packagingFeeNgn, product?.currency || 'NGN')}</Typography>
                        </View> */}
                        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 0 }]} />
                        <View style={styles.summaryRow}>
                            <Typography variant="bodyBold">Total Payable</Typography>
                            <Typography variant="h3" color={colors.primary}>
                                {formatCurrency((Number(product?.price || 0) + Number(product?.deliveryFee || deliveryFeeNgn) + Number(product?.packagingFee || packagingFeeNgn)) || 0, product?.currency || 'NGN')}
                            </Typography>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer CTA */}
                <View style={[styles.footer, { padding: spacing.xl,  paddingBottom: insets.bottom + 20}]}>
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
    recipientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        gap: 12,
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    section: {
        marginBottom: 32,
    },
    sectionLabel: {
        marginBottom: 16,
        fontSize: 16,
    },
    detailCard: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardMain: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 12,
    },
    addressInfo: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    packagingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 10,
    },
    packagingIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.02)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    miniBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    toggleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 10,
    },
    summaryCard: {
        marginTop: 16,
        padding: 20,
        borderRadius: 10,
        // borderWidth: 1,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.1,
    },
    footer: {
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    submitBtn: {
        width: '100%',
        // height: 56,
        // borderRadius: 28,
    },
});
