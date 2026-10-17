import Button from '@/components/ui/Button';
import FeatureUnavailable from '@/components/features/FeatureUnavailable';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { useGetUpcomingEventsQuery } from '@/store/api/event';
import { useCreateGiftRequestMutation } from '@/store/api/giftRequestApi';
import { useUploadMutation } from '@/store/api/uploadApi';
import { useAppSelector } from '@/store/hooks';
import { formatCurrency, formatInputNumber, getCurrencySymbol, parseCurrencyInput } from '@/utils/formatCurrency';
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Calendar01Icon,
    Camera01Icon,
    CheckmarkCircle02Icon,
    ContactBookIcon,
    GiftIcon,
    Location01Icon,
    SentIcon,
    SparklesIcon,
    Time02Icon,
    UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as Contacts from 'expo-contacts/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

const categories = ['Something custom', 'Fashion', 'Tech', 'Home', 'Experience', 'Collectible'];
const preferences = ['Personalised', 'Handmade', 'Local maker', 'Eco-friendly', 'Luxury', 'Fast delivery'];
const recurrenceOptions = [
    { value: 'NONE', label: 'One time' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'YEARLY', label: 'Yearly' },
] as const;
const deliveryWindows = [
    { value: 'Morning', label: 'Morning', detail: '8 AM – 12 PM' },
    { value: 'Afternoon', label: 'Afternoon', detail: '12 PM – 4 PM' },
    { value: 'Evening', label: 'Evening', detail: '4 PM – 8 PM' },
] as const;

type RecurrenceType = (typeof recurrenceOptions)[number]['value'];
type DeliveryWindow = (typeof deliveryWindows)[number]['value'];

const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const errorMessage = (error: unknown) => {
    const message = (error as { data?: { message?: string | string[] } })?.data?.message;
    return Array.isArray(message) ? message.join('\n') : message || 'Please try again.';
};

export default function GiftRequestScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ recipient?: string; occasion?: string; item?: string; eventId?: string }>();
    const { colors, spacing } = useTheme();
    const { enabled: giftRequestsEnabled } = useFeatureFlag('gift_requests');
    const { enabled: aiEnabled } = useFeatureFlag('ai_assistant');
    const { user } = useAppSelector((state) => state.auth);
    const currency = user?.currency || 'NGN';
    const { data: upcomingEvents = [] } = useGetUpcomingEventsQuery();
    const [uploadImage, { isLoading: isUploading }] = useUploadMutation();
    const [createGiftRequest, { isLoading: isSubmitting }] = useCreateGiftRequestMutation();
    const [step, setStep] = useState(0);
    const [selectedEventId, setSelectedEventId] = useState(params.eventId || '');
    const [showSavedEvents, setShowSavedEvents] = useState(Boolean(params.eventId));
    const [selectedContactId, setSelectedContactId] = useState('');
    const [recipient, setRecipient] = useState(params.recipient || '');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [occasion, setOccasion] = useState(params.occasion || '');
    const [eventDate, setEventDate] = useState<Date | null>(null);
    const [showEventDatePicker, setShowEventDatePicker] = useState(false);
    const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('NONE');
    const [relationship, setRelationship] = useState('');
    const [description, setDescription] = useState(params.item || '');
    const [category, setCategory] = useState(categories[0]);
    const [referenceLink, setReferenceLink] = useState('');
    const [referenceImage, setReferenceImage] = useState('');
    const [budget, setBudget] = useState('');
    const [deliveryDate, setDeliveryDate] = useState(() => {
        const date = new Date();
        date.setDate(date.getDate() + 14);
        return date;
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [deliveryTimeWindow, setDeliveryTimeWindow] = useState<DeliveryWindow | null>(null);
    const [giftMessage, setGiftMessage] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [addressCity, setAddressCity] = useState('');
    const [addressState, setAddressState] = useState('');
    const [addressCountry, setAddressCountry] = useState('Nigeria');
    const [activeAction, setActiveAction] = useState<'ai' | 'request' | null>(null);

    const selectEvent = (event: (typeof upcomingEvents)[number]) => {
        const eventContact = event.contact || event.contacts?.[0];
        setSelectedEventId(event.id);
        setSelectedContactId(eventContact?.id || '');
        setRecipient(eventContact?.name || '');
        setRecipientPhone(eventContact?.phoneNumber || '');
        setOccasion(event.title);
    };

    const pickPhoneContact = async () => {
        try {
            if (Platform.OS === 'android') {
                const { status } = await Contacts.requestPermissionsAsync();
                if (status !== 'granted') {
                    toast.error('Contact access is needed', { description: 'Allow contact access or enter the details manually.' });
                    return;
                }
            }

            const contact = await Contacts.presentContactPickerAsync();
            if (!contact) return;

            const phoneNumber = contact.phoneNumbers?.[0]?.number || '';
            setSelectedEventId('');
            setSelectedContactId('');
            setRecipient(contact.name || '');
            setRecipientPhone(phoneNumber);

            if (!phoneNumber) {
                toast.error('No phone number found', { description: 'Please enter a number manually.' });
            }
        } catch {
            toast.error('Could not open contacts', { description: 'Please enter the details manually.' });
        }
    };

    const pickReference = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });
        if (!result.canceled && result.assets[0]?.uri) setReferenceImage(result.assets[0].uri);
    };

    const changeDate = (event: DateTimePickerEvent, value?: Date) => {
        if (Platform.OS === 'android') setShowDatePicker(false);
        if (event.type === 'set' && value) setDeliveryDate(value);
    };

    const changeEventDate = (event: DateTimePickerEvent, value?: Date) => {
        if (Platform.OS === 'android') setShowEventDatePicker(false);
        if (event.type !== 'set' || !value) return;

        setEventDate(value);
        if (deliveryDate.getTime() > value.getTime()) setDeliveryDate(value);
    };

    const togglePreference = (value: string) => {
        setSelectedPreferences((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
    };

    const hasRecipientContact = recipient.trim().length > 1 && recipientPhone.trim().length >= 7;
    const hasNewEventDetails = hasRecipientContact && occasion.trim().length > 1 && Boolean(eventDate);
    const hasNewAddress = addressLine1.trim().length > 2
        && addressCity.trim().length > 1
        && addressState.trim().length > 1
        && addressCountry.trim().length > 1;
    const canContinue = step === 0
        ? Boolean(selectedEventId) || hasNewEventDetails
        : step === 1
            ? description.trim().length > 9
            : step === 2
                ? parseCurrencyInput(budget) > 0 && Boolean(deliveryTimeWindow) && (Boolean(selectedEventId) || hasNewAddress)
                : true;

    const uploadReference = async () => {
        if (!referenceImage) return undefined;
        return uploadImage(referenceImage).unwrap();
    };

    const buildAiBrief = (uploadedReference?: string) => [
        'I would like help with a custom gift request that I could not find in the shop.',
        `Recipient: ${recipient.trim()}`,
        recipientPhone.trim() ? `Recipient phone: ${recipientPhone.trim()}` : '',
        `Occasion: ${occasion.trim() || 'Just because'}`,
        !selectedEventId && eventDate ? `Event date: ${formatDate(eventDate)}` : '',
        !selectedEventId ? `Event frequency: ${recurrenceOptions.find((item) => item.value === recurrenceType)?.label}` : '',
        !selectedEventId && relationship.trim() ? `Relationship: ${relationship.trim()}` : '',
        `What I need: ${description.trim()}`,
        `Category: ${category}`,
        `Budget: up to ${formatCurrency(parseCurrencyInput(budget), currency)}`,
        `Needed by: ${formatDate(deliveryDate)}`,
        deliveryTimeWindow ? `Delivery window: ${deliveryTimeWindow}` : '',
        giftMessage.trim() ? `Gift message: ${giftMessage.trim()}` : '',
        isAnonymous ? 'Keep the sender anonymous: Yes' : '',
        selectedPreferences.length ? `Preferences: ${selectedPreferences.join(', ')}` : '',
        !selectedEventId && hasNewAddress
            ? `Delivery address: ${[addressLine1.trim(), addressLine2.trim(), addressCity.trim(), addressState.trim(), addressCountry.trim()].filter(Boolean).join(', ')}`
            : '',
        referenceLink.trim() ? `Reference link: ${referenceLink.trim()}` : '',
        uploadedReference ? `Reference image: ${uploadedReference}` : '',
        'Please act as my GiftSync gift concierge and help me find or source the closest suitable option.',
    ].filter(Boolean).join('\n');

    const runThroughAi = async () => {
        if (!aiEnabled) {
            toast.error('The AI concierge is currently unavailable.');
            return;
        }
        setActiveAction('ai');
        try {
            const uploadedReference = await uploadReference();
            router.replace({ pathname: '/ai-chat', params: { initialMessage: buildAiBrief(uploadedReference) } });
        } catch (error: unknown) {
            toast.error('Could not open the AI concierge', { description: errorMessage(error) });
        } finally {
            setActiveAction(null);
        }
    };

    const submitRequest = async () => {
        if (!deliveryTimeWindow) {
            setStep(2);
            toast.error('Choose a delivery window');
            return;
        }

        setActiveAction('request');
        try {
            const uploadedReference = await uploadReference();
            const createdRequest = await createGiftRequest({
                eventId: selectedEventId || undefined,
                contactId: selectedContactId || undefined,
                newEvent: !selectedEventId && eventDate ? {
                    title: occasion.trim(),
                    date: eventDate.toISOString(),
                    recurrenceType,
                    name: recipient.trim(),
                    phoneNumber: recipientPhone.trim(),
                    relationship: relationship.trim() || undefined,
                } : undefined,
                newAddress: !selectedEventId ? {
                    recipientName: recipient.trim(),
                    line1: addressLine1.trim(),
                    line2: addressLine2.trim() || undefined,
                    city: addressCity.trim(),
                    state: addressState.trim(),
                    country: addressCountry.trim(),
                } : undefined,
                orderDetails: {
                    deliveryDate: deliveryDate.toISOString(),
                    deliveryTimeWindow,
                    giftMessage: giftMessage.trim() || undefined,
                    anonymity: isAnonymous,
                    quantity: 1,
                },
                recipientName: recipient.trim(),
                recipientPhoneNumber: recipientPhone.trim() || undefined,
                occasion: occasion.trim() || undefined,
                description: description.trim(),
                category,
                budget: parseCurrencyInput(budget),
                currency,
                neededBy: deliveryDate.toISOString(),
                preferences: selectedPreferences,
                referenceLink: referenceLink.trim() || undefined,
                referenceImageUrl: uploadedReference,
            }).unwrap();
            if (createdRequest.orderId && createdRequest.paymentStatus !== 'paid') {
                toast.success('Request created', { description: 'Complete payment to send it to the sourcing team.' });
                router.replace({
                    pathname: '/checkout/payment',
                    params: {
                        orderId: createdRequest.orderId,
                        giftRequestId: createdRequest.id,
                        currency: createdRequest.currency || currency,
                        paymentUrl: createdRequest.paymentUrl,
                    },
                });
            } else {
                toast.success('Request sent', { description: 'The sourcing team will review your brief and follow up.' });
                router.replace('/(tabs)/shop');
            }
        } catch (error: unknown) {
            toast.error('Request not sent', { description: errorMessage(error) });
        } finally {
            setActiveAction(null);
        }
    };

    const renderStep = () => {
        if (step === 0) {
            return (
                <View style={styles.stepContent}>
                    <View style={styles.titleBlock}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>STEP 1 · THEIR MOMENT</Typography>
                        <Typography variant="h1">Who’s this for?</Typography>
                        <Typography variant="body" color={colors.textSecondary}>Pick a saved event or enter the details for a new one.</Typography>
                    </View>
                    {upcomingEvents.length > 0 && !showSavedEvents && (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Choose from saved events"
                            onPress={() => setShowSavedEvents(true)}
                            style={[styles.savedEventsButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}
                        >
                            <HugeiconsIcon icon={Calendar01Icon} size={16} color={colors.primary} />
                            <Typography variant="caption" color={colors.primary}>Choose a saved event</Typography>
                        </Pressable>
                    )}
                    {upcomingEvents.length > 0 && showSavedEvents && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.peopleRow}>
                            {upcomingEvents.slice(0, 8).map((event, index) => {
                                const name = event.contact?.name || event.contacts?.[0]?.name || event.title;
                                const selected = selectedEventId === event.id;
                                const swatches = [colors.lemon, colors.mint, colors.lilac, colors.peach];
                                return (
                                    <Pressable
                                        key={event.id}
                                        onPress={() => selectEvent(event)}
                                        style={[styles.personCard, { backgroundColor: swatches[index % swatches.length], borderColor: colors.ink }, selected && { borderWidth: 3 }]}
                                    >
                                        <View style={[styles.personInitial, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                            <Typography variant="h4">{name.charAt(0).toUpperCase()}</Typography>
                                        </View>
                                        <Typography variant="bodyBold" numberOfLines={1}>{name}</Typography>
                                        <Typography variant="caption" numberOfLines={1}>{event.title}</Typography>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                    )}
                    <View style={styles.formStack}>
                        <Input
                            label="Their name"
                            placeholder="e.g. Susan"
                            value={recipient}
                            onChangeText={(value) => {
                                setRecipient(value);
                                setSelectedEventId('');
                                setSelectedContactId('');
                            }}
                        />
                        <Input
                            label={selectedEventId ? 'Phone number (optional for saved dates)' : 'Phone number'}
                            placeholder="e.g. +234 800 000 0000"
                            value={recipientPhone}
                            onChangeText={(value) => {
                                setRecipientPhone(value);
                                setSelectedContactId('');
                            }}
                            keyboardType="phone-pad"
                            rightIcon={(
                                <Pressable accessibilityLabel="Choose from phone contacts" hitSlop={10} onPress={pickPhoneContact}>
                                    <HugeiconsIcon icon={ContactBookIcon} size={22} color={colors.primary} />
                                </Pressable>
                            )}
                        />
                        <Input
                            label={selectedEventId ? 'Occasion' : 'Occasion or event name'}
                            placeholder="Birthday, anniversary, just because..."
                            value={occasion}
                            onChangeText={(value) => {
                                setOccasion(value);
                                setSelectedEventId('');
                            }}
                        />
                        {!selectedEventId && (
                            <>
                                <View>
                                    <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: 8 }}>Event date</Typography>
                                    <Pressable onPress={() => setShowEventDatePicker(true)} style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                        <HugeiconsIcon icon={Calendar01Icon} size={21} color={colors.primary} />
                                        <Typography variant="bodyMedium" color={eventDate ? colors.textPrimary : colors.textMuted} style={{ flex: 1 }}>
                                            {eventDate ? formatDate(eventDate) : 'Select the event date'}
                                        </Typography>
                                        <Typography variant="caption" color={colors.primary}>{eventDate ? 'Change' : 'Add'}</Typography>
                                    </Pressable>
                                    {showEventDatePicker && (
                                        <DateTimePicker
                                            value={eventDate || new Date()}
                                            mode="date"
                                            minimumDate={new Date()}
                                            onChange={changeEventDate}
                                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                        />
                                    )}
                                </View>
                                <Input
                                    label="Relationship (optional)"
                                    placeholder="e.g. Friend, partner, colleague"
                                    value={relationship}
                                    onChangeText={setRelationship}
                                />
                                <View>
                                    <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: 8 }}>How often does it repeat?</Typography>
                                    <View style={styles.chipGrid}>
                                        {recurrenceOptions.map((item) => (
                                            <Pressable
                                                key={item.value}
                                                onPress={() => setRecurrenceType(item.value)}
                                                style={[styles.chip, { backgroundColor: recurrenceType === item.value ? colors.ink : colors.surface, borderColor: colors.ink }]}
                                            >
                                                <Typography variant="label" color={recurrenceType === item.value ? colors.surface : colors.textPrimary}>{item.label}</Typography>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                                <Typography variant="caption" color={colors.textSecondary}>Name, phone number, event name, and date are required for a new event. Tap the contact-book icon to autofill the recipient.</Typography>
                            </>
                        )}
                    </View>
                </View>
            );
        }

        if (step === 1) {
            return (
                <View style={styles.stepContent}>
                    <View style={styles.titleBlock}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>STEP 2 · THE IDEA</Typography>
                        <Typography variant="h1">Describe the perfect find.</Typography>
                        <Typography variant="body" color={colors.textSecondary}>Specific details help us get much closer.</Typography>
                    </View>
                    <Input
                        label="What are you looking for?"
                        placeholder="A restored 1980s film camera in silver, ideally with a leather case..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={6}
                        maxLength={600}
                    />
                    <View>
                        <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: 8 }}>Best category</Typography>
                        <View style={styles.chipGrid}>
                            {categories.map((item) => (
                                <Pressable
                                    key={item}
                                    onPress={() => setCategory(item)}
                                    style={[styles.chip, { backgroundColor: category === item ? colors.ink : colors.surface, borderColor: colors.ink }]}
                                >
                                    <Typography variant="label" color={category === item ? colors.surface : colors.textPrimary}>{item}</Typography>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                    <Input label="Reference link (optional)" placeholder="Paste a product or inspiration link" value={referenceLink} onChangeText={setReferenceLink} autoCapitalize="none" />
                    <Pressable onPress={pickReference} style={[styles.uploadCard, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                        {referenceImage ? (
                            <Image source={{ uri: referenceImage }} style={styles.referenceImage} contentFit="cover" />
                        ) : (
                            <View style={[styles.uploadIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={Camera01Icon} size={24} color={colors.ink} />
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Typography variant="bodyBold">{referenceImage ? 'Reference added' : 'Add a reference photo'}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>{referenceImage ? 'Tap to replace it' : 'A screenshot works perfectly'}</Typography>
                        </View>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={20} color={colors.ink} />
                    </Pressable>
                </View>
            );
        }

        if (step === 2) {
            return (
                <View style={styles.stepContent}>
                    <View style={styles.titleBlock}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>STEP 3 · THE DETAILS</Typography>
                        <Typography variant="h1">Budget and timing.</Typography>
                        <Typography variant="body" color={colors.textSecondary}>We’ll keep the search realistic and on schedule.</Typography>
                    </View>
                    <Input
                        label={`Maximum budget (${currency})`}
                        placeholder="0"
                        value={budget}
                        onChangeText={(value) => setBudget(formatInputNumber(value))}
                        keyboardType="numeric"
                        leftIcon={<Typography variant="bodyBold" color={colors.textSecondary}>{getCurrencySymbol(currency)}</Typography>}
                    />
                    <View>
                        <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: 8 }}>Needed by</Typography>
                        <Pressable onPress={() => setShowDatePicker(true)} style={[styles.dateButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={Calendar01Icon} size={21} color={colors.primary} />
                            <Typography variant="bodyMedium" style={{ flex: 1 }}>{formatDate(deliveryDate)}</Typography>
                            <Typography variant="caption" color={colors.primary}>Change</Typography>
                        </Pressable>
                        {showDatePicker && (
                            <DateTimePicker
                                value={deliveryDate}
                                mode="date"
                                minimumDate={new Date()}
                                maximumDate={!selectedEventId && eventDate ? eventDate : undefined}
                                onChange={changeDate}
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            />
                        )}
                    </View>
                    <View>
                        <View style={styles.fieldHeading}>
                            <Typography variant="label" color={colors.textSecondary}>Delivery window</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>REQUIRED</Typography>
                        </View>
                        <View style={styles.deliveryWindowGrid}>
                            {deliveryWindows.map((item) => {
                                const selected = deliveryTimeWindow === item.value;
                                return (
                                    <Pressable
                                        key={item.value}
                                        onPress={() => setDeliveryTimeWindow(item.value)}
                                        style={[
                                            styles.deliveryWindow,
                                            {
                                                backgroundColor: selected ? colors.sky : colors.surface,
                                                borderColor: colors.ink,
                                            },
                                        ]}
                                    >
                                        <HugeiconsIcon icon={Time02Icon} size={18} color={colors.ink} />
                                        <Typography variant="label">{item.label}</Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>{item.detail}</Typography>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                    <View>
                        <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: 8 }}>Nice-to-haves (optional)</Typography>
                        <View style={styles.chipGrid}>
                            {preferences.map((item) => {
                                const selected = selectedPreferences.includes(item);
                                return (
                                    <Pressable key={item} onPress={() => togglePreference(item)} style={[styles.chip, { backgroundColor: selected ? colors.lilac : colors.surface, borderColor: colors.ink }]}>
                                        {selected && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color={colors.ink} />}
                                        <Typography variant="label">{item}</Typography>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                    {!selectedEventId && (
                        <View style={styles.addressSection}>
                            <View style={styles.addressHeading}>
                                <View style={[styles.addressIcon, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                                    <HugeiconsIcon icon={Location01Icon} size={21} color={colors.ink} />
                                </View>
                                <View style={{ flex: 1, gap: 2 }}>
                                    <Typography variant="h3">Where should it go?</Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>We’ll add this address with the new event.</Typography>
                                </View>
                            </View>
                            <Input label="Address line 1" placeholder="Street and house number" value={addressLine1} onChangeText={setAddressLine1} />
                            <Input label="Address line 2 (optional)" placeholder="Apartment, suite, landmark..." value={addressLine2} onChangeText={setAddressLine2} />
                            <View style={styles.addressRow}>
                                <Input label="City" placeholder="Lagos" value={addressCity} onChangeText={setAddressCity} style={styles.addressField} />
                                <Input label="State" placeholder="Lagos" value={addressState} onChangeText={setAddressState} style={styles.addressField} />
                            </View>
                            <Input label="Country" placeholder="Nigeria" value={addressCountry} onChangeText={setAddressCountry} />
                        </View>
                    )}
                    <View style={[styles.giftMessageCard, { backgroundColor: colors.lilac, borderColor: colors.ink }]}>
                        <View style={styles.addressHeading}>
                            <View style={[styles.addressIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={GiftIcon} size={21} color={colors.ink} />
                            </View>
                            <View style={{ flex: 1, gap: 2 }}>
                                <Typography variant="bodyBold">Add a gift message</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>Optional — it will be included with the order.</Typography>
                            </View>
                        </View>
                        <Input
                            placeholder="Write something they’ll keep..."
                            value={giftMessage}
                            onChangeText={setGiftMessage}
                            multiline
                            numberOfLines={4}
                            maxLength={300}
                        />
                    </View>
                    <View style={[styles.anonymousCard, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <View style={[styles.addressIcon, { backgroundColor: colors.peach, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={UserIcon} size={21} color={colors.ink} />
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                            <Typography variant="bodyBold">Make it a mystery</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Keep your name off the gift card.</Typography>
                        </View>
                        <Switch
                            value={isAnonymous}
                            onValueChange={setIsAnonymous}
                            trackColor={{ false: colors.textMuted, true: colors.primary }}
                            thumbColor={colors.surface}
                        />
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.stepContent}>
                <View style={styles.titleBlock}>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>ONE LAST LOOK</Typography>
                    <Typography variant="h1">Ready for the concierge.</Typography>
                    <Typography variant="body" color={colors.textSecondary}>Review the brief, then {aiEnabled ? 'ask AI to refine it or ' : ''}send it directly to the sourcing team.</Typography>
                </View>
                <View style={[styles.reviewCard, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                    <View style={[styles.reviewIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={GiftIcon} size={30} color={colors.primary} />
                    </View>
                    <Typography variant="h2">For {recipient}</Typography>
                    <Typography variant="body" color={colors.textSecondary}>{occasion || 'Just because'}</Typography>
                    <View style={[styles.reviewDivider, { backgroundColor: colors.ink }]} />
                    <ReviewRow
                        label={selectedEventId ? 'Saved date' : 'Recipient contact'}
                        value={selectedEventId ? occasion || 'Selected event' : recipientPhone}
                        onEdit={() => setStep(0)}
                    />
                    {!selectedEventId && eventDate && <ReviewRow label="Event date" value={formatDate(eventDate)} onEdit={() => setStep(0)} />}
                    {!selectedEventId && <ReviewRow label="Frequency" value={recurrenceOptions.find((item) => item.value === recurrenceType)?.label || recurrenceType} onEdit={() => setStep(0)} />}
                    {!selectedEventId && relationship.trim() && <ReviewRow label="Relationship" value={relationship.trim()} onEdit={() => setStep(0)} />}
                    <ReviewRow label="The request" value={description} onEdit={() => setStep(1)} />
                    <ReviewRow label="Category" value={category} onEdit={() => setStep(1)} />
                    <ReviewRow label="Budget" value={`Up to ${formatCurrency(parseCurrencyInput(budget), currency)}`} onEdit={() => setStep(2)} />
                    <ReviewRow label="Needed by" value={formatDate(deliveryDate)} onEdit={() => setStep(2)} />
                    {deliveryTimeWindow && <ReviewRow label="Delivery window" value={deliveryTimeWindow} onEdit={() => setStep(2)} />}
                    {giftMessage.trim() && <ReviewRow label="Gift message" value={giftMessage.trim()} onEdit={() => setStep(2)} />}
                    <ReviewRow label="Sender name" value={isAnonymous ? 'Anonymous' : 'Include my name'} onEdit={() => setStep(2)} />
                    {!!selectedPreferences.length && <ReviewRow label="Preferences" value={selectedPreferences.join(' · ')} onEdit={() => setStep(2)} />}
                    {!selectedEventId && hasNewAddress && (
                        <ReviewRow
                            label="Delivery address"
                            value={[addressLine1.trim(), addressLine2.trim(), addressCity.trim(), addressState.trim(), addressCountry.trim()].filter(Boolean).join(', ')}
                            onEdit={() => setStep(2)}
                        />
                    )}
                </View>
                {aiEnabled && (
                    <View style={[styles.noteCard, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={SparklesIcon} size={21} color={colors.primary} />
                        <Typography variant="caption" color={colors.textSecondary} style={{ flex: 1 }}>AI chat can help sharpen the idea first. Direct submission sends this exact brief to the GiftSync sourcing team.</Typography>
                    </View>
                )}
            </View>
        );
    };

    if (!giftRequestsEnabled) {
        return <FeatureUnavailable title="Gift requests are unavailable" />;
    }

    return (
        <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={0}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { paddingTop: insets.top + 10, paddingHorizontal: spacing.xl }]}>
                <Pressable onPress={() => step > 0 ? setStep(step - 1) : router.back()} style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={colors.ink} />
                </Pressable>
                <View style={styles.progressTrack}>
                    {[0, 1, 2, 3].map((item) => <View key={item} style={[styles.progressSegment, { backgroundColor: item <= step ? colors.primary : colors.surfaceRaised, borderColor: colors.ink }]} />)}
                </View>
                <Typography variant="caption" style={styles.stepCount}>{step + 1}/4</Typography>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.xl }]}>
                {renderStep()}
            </ScrollView>
            <View style={[styles.footer, { paddingHorizontal: spacing.xl, paddingBottom: Math.max(insets.bottom, 14), backgroundColor: colors.background, borderTopColor: colors.ink }]}>
                {step < 3 ? (
                    <Button title="Continue" disabled={!canContinue} onPress={() => setStep(step + 1)} rightIcon={<HugeiconsIcon icon={ArrowRight01Icon} size={19} color="#17151D" />} style={styles.fullButton} />
                ) : (
                    <View style={styles.finalActions}>
                        {aiEnabled && (
                            <Button
                                title="Run through AI chat"
                                variant="outline"
                                disabled={activeAction === 'request' || isSubmitting}
                                isLoading={activeAction === 'ai' && isUploading}
                                onPress={runThroughAi}
                                leftIcon={<HugeiconsIcon icon={SparklesIcon} size={19} color={colors.primary} />}
                                style={styles.fullButton}
                            />
                        )}
                        <Button
                            title="Send sourcing request"
                            disabled={activeAction === 'ai'}
                            isLoading={activeAction === 'request' && (isUploading || isSubmitting)}
                            onPress={submitRequest}
                            rightIcon={<HugeiconsIcon icon={SentIcon} size={19} color="#17151D" />}
                            style={styles.fullButton}
                        />
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
    const { colors } = useTheme();
    return (
        <View style={styles.reviewRow}>
            <View style={{ flex: 1, gap: 2 }}>
                <Typography variant="caption" color={colors.textSecondary}>{label.toUpperCase()}</Typography>
                <Typography variant="bodyMedium">{value}</Typography>
            </View>
            <Pressable onPress={onEdit}><Typography variant="caption" color={colors.primary}>Edit</Typography></Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: 12 },
    backButton: { width: 42, height: 42, borderWidth: 1.5, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    progressTrack: { flex: 1, flexDirection: 'row', gap: 5 },
    progressSegment: { flex: 1, height: 8, borderWidth: 1, borderRadius: 5 },
    stepCount: { width: 28, textAlign: 'right', fontFamily: 'DMSans_700Bold' },
    scrollContent: { paddingTop: 14, paddingBottom: 30 },
    stepContent: { gap: 22 },
    titleBlock: { gap: 6 },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 0.9 },
    peopleRow: { gap: 10 },
    savedEventsButton: { minHeight: 34, alignSelf: 'flex-start', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 7 },
    personCard: { width: 138, borderWidth: 1.5, borderRadius: 18, padding: 12, gap: 4 },
    personInitial: { width: 42, height: 42, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 5 },
    formStack: { gap: 16 },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
    chip: { minHeight: 40, paddingHorizontal: 13, borderWidth: 1.5, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 6 },
    uploadCard: { borderWidth: 1.5, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
    uploadIcon: { width: 48, height: 48, borderWidth: 1.5, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    referenceImage: { width: 58, height: 58, borderRadius: 13, borderWidth: 1.5, borderColor: '#17151D' },
    dateButton: { minHeight: 56, borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
    fieldHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    deliveryWindowGrid: { flexDirection: 'row', gap: 8 },
    deliveryWindow: { flex: 1, minHeight: 96, borderWidth: 1.5, borderRadius: 15, padding: 10, gap: 4, justifyContent: 'center', },
    addressSection: { gap: 14 },
    addressHeading: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 2 },
    addressIcon: { width: 44, height: 44, borderWidth: 1.5, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    addressRow: { flexDirection: 'row', gap: 10 },
    addressField: { flex: 1 },
    giftMessageCard: { borderWidth: 1.5, borderRadius: 20, padding: 14, gap: 13 },
    anonymousCard: { borderWidth: 1.5, borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
    reviewCard: { borderWidth: 1.5, borderRadius: 24, padding: 20, },
    reviewIcon: { width: 56, height: 56, borderWidth: 1.5, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14, transform: [{ rotate: '-4deg' }] },
    reviewDivider: { height: 1, marginVertical: 17 },
    reviewRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 14 },
    noteCard: { borderWidth: 1.5, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
    footer: { borderTopWidth: 1, paddingTop: 12 },
    finalActions: { gap: 10 },
    fullButton: { width: '100%' },
});
