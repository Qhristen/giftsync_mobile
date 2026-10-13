import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import AddressPickerSheet from '@/components/sheets/AddressPickerSheet';
import DeliveryOptionsSheet from '@/components/sheets/DeliveryOptionsSheet';
import CheckoutSkeleton from '@/components/skeletons/CheckoutSkeleton';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';
import { useTheme } from '@/hooks/useTheme';
import { useGetEventDetailQuery } from '@/store/api/event';
import { useCreateOrderMutation } from '@/store/api/orderApi';
import { useGetProductByIdQuery } from '@/store/api/productApi';
import { Address } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { Calendar01Icon, GiftIcon, Location01Icon, Time02Icon, UserIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDays, format, startOfDay, subDays } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function DeliveryScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { deliveryFeeNgn, packagingFeeNgn } = usePlatformConfig();
    const { occasionId, productId } = useLocalSearchParams<{ occasionId: string; productId: string }>();
    const insets = useSafeAreaInsets();
    const { data: product, isLoading: initialProductLoading, isFetching: isProductFetching } = useGetProductByIdQuery(productId as string, { skip: !productId });
    const { data: event, isLoading: initialEventLoading, isFetching: isEventFetching } = useGetEventDetailQuery(occasionId as string, { skip: !occasionId });
    const isLoading = initialProductLoading || isProductFetching || initialEventLoading || isEventFetching;

    const [deliveryAddress, setDeliveryAddress] = React.useState<Address | null>(null);
    const [deliveryDate, setDeliveryDate] = React.useState<string | null>(null);
    const [deliveryTimeWindow, setDeliveryTimeWindow] = React.useState<'morning' | 'afternoon' | 'evening' | null>(null);
    const [giftMessage, setGiftMessage] = React.useState('');
    const [isAnonymous, setIsAnonymous] = React.useState(false);
    const [showDatePicker, setShowDatePicker] = React.useState(false);

    const addressSheet = useBottomSheet();
    const optionsSheet = useBottomSheet();
    const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

    const maxDate = useMemo(() => {
        if (!event?.date) return addDays(new Date(), 14);
        return subDays(startOfDay(new Date(event.date)), 1);
    }, [event?.date]);
    const minDate = useMemo(() => startOfDay(new Date()), []);
    const total = (Number(product?.price) || 0)
        + (Number(product?.deliveryFee || deliveryFeeNgn) || 0)
        + (Number(product?.packagingFee || packagingFeeNgn) || 0);

    React.useEffect(() => {
        if (!deliveryDate && event) {
            const today = startOfDay(new Date());
            setDeliveryDate(format(today <= maxDate ? today : maxDate, 'yyyy-MM-dd'));
        }
    }, [deliveryDate, maxDate, event]);

    const handleNext = async () => {
        if (!deliveryAddress || !deliveryDate || !deliveryTimeWindow) {
            toast.error('Complete the route', { description: 'Select an address, date, and delivery window.' });
            return;
        }

        try {
            const timeWindowFormatted = deliveryTimeWindow.charAt(0).toUpperCase() + deliveryTimeWindow.slice(1);
            const result = await createOrder({
                productId: product?.id as string,
                eventId: event?.id as string,
                deliveryAddressId: deliveryAddress.id as string,
                recipientName: event?.contact?.name as string,
                deliveryDate,
                deliveryTimeWindow: timeWindowFormatted,
                giftMessage,
                anonymity: isAnonymous,
                quantity: 1,
            }).unwrap();

            router.push({ pathname: '/checkout/payment', params: { orderId: result.id } });
        } catch (error: any) {
            console.error('Failed to create order', error);
            toast.error(error?.data?.message || 'Failed to create order. Please try again.');
        }
    };

    if (isLoading) {
        return <CheckoutSkeleton step={2} onBack={() => router.back()} />;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
                <CheckoutProgress
                    step={2}
                    eyebrow="Delivery map"
                    title="Plot the delivery route"
                    onBack={() => router.back()}
                />

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={[styles.routeCard, { backgroundColor: colors.mint, borderColor: colors.ink, shadowColor: colors.ink }]}>
                        <View style={styles.routeTop}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>GIFT ROUTE · ONE HAPPY STOP</Typography>
                            <View style={[styles.routeBadge, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <Typography variant="caption" style={styles.badgeCopy}>LIVE PLAN</Typography>
                            </View>
                        </View>
                        <View style={styles.routeLine}>
                            <View style={[styles.routePoint, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={GiftIcon} size={20} color={colors.ink} />
                            </View>
                            <View style={[styles.dottedRoute, { borderColor: colors.ink }]} />
                            <Avatar name={event?.contact?.name || 'Recipient'} uri={event?.contact?.avatar} size="lg" />
                        </View>
                        <View style={styles.routeLabels}>
                            <View>
                                <Typography variant="bodyBold">GiftSync desk</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>{product?.name || 'Your gift'}</Typography>
                            </View>
                            <View style={styles.routeRecipient}>
                                <Typography variant="bodyBold" align="right">{event?.contact?.name || 'Someone special'}</Typography>
                                <Typography variant="caption" color={colors.textSecondary} align="right">{event?.title || 'Their big moment'}</Typography>
                            </View>
                        </View>
                    </View>

                    <View style={styles.sectionHeading}>
                        <Typography variant="label">01 · Destination</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>REQUIRED</Typography>
                    </View>
                    <Pressable
                        onPress={() => addressSheet.open()}
                        style={({ pressed }) => [
                            styles.destinationTicket,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.ink,
                                shadowColor: colors.lilac,
                                opacity: pressed ? 0.72 : 1,
                            },
                        ]}
                    >
                        <View style={[styles.ticketIcon, { backgroundColor: colors.peach, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={Location01Icon} size={23} color={colors.ink} />
                        </View>
                        <View style={styles.destinationCopy}>
                            <Typography variant="caption" color={colors.textSecondary}>DELIVER TO</Typography>
                            {deliveryAddress ? (
                                <>
                                    <Typography variant="bodyBold">{deliveryAddress.recipientName}</Typography>
                                    <Typography variant="caption" color={colors.textSecondary} numberOfLines={2}>
                                        {deliveryAddress.line1}, {deliveryAddress.city}, {deliveryAddress.state}
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="bodyBold">Pin a delivery address</Typography>
                            )}
                        </View>
                        <Typography variant="bodyBold">{deliveryAddress ? 'EDIT' : 'ADD'} →</Typography>
                    </Pressable>

                    <View style={styles.sectionHeading}>
                        <Typography variant="label">02 · Arrival window</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>BEFORE THE MOMENT</Typography>
                    </View>
                    <View style={styles.scheduleRow}>
                        <Pressable
                            onPress={() => setShowDatePicker(true)}
                            style={({ pressed }) => [
                                styles.scheduleCard,
                                { backgroundColor: colors.lemon, borderColor: colors.ink, opacity: pressed ? 0.72 : 1 },
                            ]}
                        >
                            <HugeiconsIcon icon={Calendar01Icon} size={22} color={colors.ink} />
                            <Typography variant="caption" color={colors.textSecondary}>DROP DATE</Typography>
                            <Typography variant="bodyBold">
                                {deliveryDate ? format(new Date(deliveryDate), 'MMM d, yyyy') : 'Choose date'}
                            </Typography>
                        </Pressable>
                        <Pressable
                            onPress={() => optionsSheet.open()}
                            style={({ pressed }) => [
                                styles.scheduleCard,
                                { backgroundColor: colors.sky, borderColor: colors.ink, opacity: pressed ? 0.72 : 1 },
                            ]}
                        >
                            <HugeiconsIcon icon={Time02Icon} size={22} color={colors.ink} />
                            <Typography variant="caption" color={colors.textSecondary}>TIME SLOT</Typography>
                            <Typography variant="bodyBold" style={styles.capitalize}>{deliveryTimeWindow || 'Choose time'}</Typography>
                        </Pressable>
                    </View>

                    {showDatePicker ? (
                        <DateTimePicker
                            value={deliveryDate ? new Date(deliveryDate) : new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(_, selectedDate) => {
                                setShowDatePicker(Platform.OS === 'ios');
                                if (selectedDate) setDeliveryDate(format(selectedDate, 'yyyy-MM-dd'));
                            }}
                            minimumDate={minDate}
                            maximumDate={maxDate}
                        />
                    ) : null}

                    <View style={styles.sectionHeading}>
                        <Typography variant="label">03 · The personal touch</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>OPTIONAL</Typography>
                    </View>
                    <View style={[styles.postcard, { backgroundColor: colors.lavender, borderColor: colors.ink, shadowColor: colors.ink }]}>
                        <View style={styles.postcardHeader}>
                            <View style={[styles.ticketIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={GiftIcon} size={22} color={colors.ink} />
                            </View>
                            <View style={styles.destinationCopy}>
                                <Typography variant="bodyBold">Ribbon, tissue & a note</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>Premium gift presentation is included.</Typography>
                            </View>
                            <View style={[styles.includedBadge, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                                <Typography variant="caption" style={styles.badgeCopy}>INCLUDED</Typography>
                            </View>
                        </View>
                        <Input
                            value={giftMessage}
                            onChangeText={setGiftMessage}
                            placeholder="Write something they will keep..."
                            multiline
                            numberOfLines={4}
                            style={styles.messageInput}
                        />
                    </View>

                    <View style={[styles.anonymousCard, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <View style={[styles.ticketIcon, { backgroundColor: colors.peach, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={UserIcon} size={21} color={colors.ink} />
                        </View>
                        <View style={styles.destinationCopy}>
                            <Typography variant="bodyBold">Make it a mystery</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Your name stays off the gift card.</Typography>
                        </View>
                        <Switch
                            value={isAnonymous}
                            onValueChange={setIsAnonymous}
                            trackColor={{ false: colors.textMuted, true: colors.primary }}
                            thumbColor={colors.surface}
                        />
                    </View>

                    <View style={[styles.totalTicket, { backgroundColor: colors.surface, borderColor: colors.ink, shadowColor: colors.ink }]}>
                        <View>
                            <Typography variant="caption" color={colors.textSecondary}>ROUTE TOTAL</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Gift + wrap + delivery</Typography>
                        </View>
                        <Typography variant="h3">{formatCurrency(total, product?.currency || 'NGN')}</Typography>
                    </View>
                </ScrollView>

                <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
                    <Button title="Save route & continue  →" onPress={handleNext} isLoading={isCreating} style={styles.submitButton} />
                </View>

                <AddressPickerSheet
                    ref={addressSheet.ref}
                    selectedAddressId={deliveryAddress?.id}
                    onSelect={(address) => {
                        setDeliveryAddress(address);
                        addressSheet.close();
                    }}
                />
                <DeliveryOptionsSheet
                    ref={optionsSheet.ref}
                    initialTimeWindow={deliveryTimeWindow}
                    onSave={(timeWindow) => {
                        setDeliveryTimeWindow(timeWindow);
                        optionsSheet.close();
                    }}
                />
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 130, gap: 18 },
    routeCard: {
        borderWidth: 1.5,
        borderRadius: 25,
        padding: 18,
        gap: 13,
        shadowOffset: { width: 4, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 0,
        elevation: 3,
        transform: [{ rotate: '0.7deg' }],
    },
    routeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    overline: { fontWeight: '700', letterSpacing: 1 },
    routeBadge: { borderWidth: 1.5, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4 },
    badgeCopy: { fontWeight: '800' },
    routeLine: { flexDirection: 'row', alignItems: 'center' },
    routePoint: { width: 52, height: 52, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    dottedRoute: { flex: 1, borderTopWidth: 2, borderStyle: 'dashed', marginHorizontal: 10 },
    routeLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
    routeRecipient: { flex: 1, alignItems: 'flex-end' },
    sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
    destinationTicket: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1.5,
        borderRadius: 20,
        padding: 15,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
    },
    ticketIcon: { width: 44, height: 44, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    destinationCopy: { flex: 1 },
    scheduleRow: { flexDirection: 'row', gap: 12 },
    scheduleCard: { flex: 1, minHeight: 122, borderWidth: 1.5, borderRadius: 20, padding: 15, gap: 7, justifyContent: 'center' },
    capitalize: { textTransform: 'capitalize' },
    postcard: {
        borderWidth: 1.5,
        borderRadius: 23,
        padding: 15,
        gap: 14,
        shadowOffset: { width: 3, height: 4 },
        shadowOpacity: 0.13,
        shadowRadius: 0,
        transform: [{ rotate: '-0.5deg' }],
    },
    postcardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    includedBadge: { borderWidth: 1.5, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4, transform: [{ rotate: '3deg' }] },
    messageInput: { minHeight: 116 },
    anonymousCard: { flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1.5, borderRadius: 20, padding: 14 },
    totalTicket: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 20,
        padding: 17,
        shadowOffset: { width: 3, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 0,
        transform: [{ rotate: '0.5deg' }],
    },
    footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 14 },
    submitButton: { width: '100%' },
});
