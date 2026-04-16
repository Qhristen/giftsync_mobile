import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Contacts from 'expo-contacts';
import React, { forwardRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

import { useGetContactsQuery } from '@/store/api/contactsApi';
import { useCreateOccasionMutation, useGetOccasionDetailQuery, useUpdateOccasionMutation } from '@/store/api/occasionApi';
import { spendCoins } from '@/store/slices/walletSlice';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner-native';

export interface OccasionFormData {
    contactId?: string;
    type: string;
    date: string; // ISO string
    notes?: string;
}

const OCCASION_TYPES = [
    'Birthday',
    'Anniversary',
    'Valentine’s Day',
    'Mother’s Day',
    'Father’s Day',
    'Christmas',
    'New Year',
    'Eid al-Fitr',
    'Eid al-Adha',
    'Friendship Day'
] as const;

interface Props {
    onSuccess?: () => void;
    isLoading?: boolean;
    isEditing?: boolean;
    occasionId?: string;
    fixedContactId?: string;
    fixedContactName?: string;
}

const CreateOccasionSheet = forwardRef<BottomSheetRef, Props>(
    ({ onSuccess, isLoading: externalLoading, isEditing, occasionId, fixedContactId, fixedContactName }, ref) => {
        const { spacing, colors } = useTheme();
        const dispatch = useDispatch();
        const { data: contactsData } = useGetContactsQuery();
        const { data: occasionDetail, isLoading: isFetchingOccasion } = useGetOccasionDetailQuery(occasionId as string, { skip: !isEditing || !occasionId });
        const [createOccasion, { isLoading: isCreatingOccasion }] = useCreateOccasionMutation();
        const [updateOccasion, { isLoading: isUpdatingOccasion }] = useUpdateOccasionMutation();

        const [isSubmitting, setIsSubmitting] = useState(false);

        const [selectedContactId, setSelectedContactId] = useState<string | undefined>(fixedContactId);
        const [contactName, setContactName] = useState(fixedContactName || "");
        const [contactNumber, setContactNumber] = useState("");

        const [type, setType] = useState<string>('Birthday');
        const [date, setDate] = useState(new Date());
        const [showPicker, setShowPicker] = useState(false);
        const [notes, setNotes] = useState("");
        const contacts = React.useMemo(() => contactsData?.items || [], [contactsData?.items]);


        React.useEffect(() => {
            if (isEditing && occasionDetail) {
                setType(occasionDetail.type);
                setDate(new Date(occasionDetail.date));
                setNotes(occasionDetail.notes || "");
                setSelectedContactId(occasionDetail.contactId);

                if (occasionDetail.contactId) {
                    const existing = contacts.find(c => c.id === occasionDetail.contactId);
                    if (existing) {
                        setContactName(existing.name);
                        setContactNumber(existing.phoneNumber || "");
                    } else if (occasionDetail.contact?.name) { // Fallback if API returned joined contact
                        setContactName(occasionDetail.contact.name);
                    }
                }
            }
        }, [isEditing, occasionDetail, contacts]);

        React.useEffect(() => {
            if (fixedContactId) setSelectedContactId(fixedContactId);
            if (fixedContactName) setContactName(fixedContactName);
        }, [fixedContactId, fixedContactName]);

        const formattedDate = date.toLocaleString('default', { month: 'long', day: 'numeric' });

        const handleSubmit = async () => {
            setIsSubmitting(true);
            try {
                let contactId = selectedContactId;

                if (!contactId && !isEditing) {
                    throw new Error("Contact ID is required");
                }

                if (isEditing && occasionId) {
                    await updateOccasion({
                        id: occasionId,
                        data: {
                            contactId,
                            type,
                            date: date.toISOString(),
                            notes,
                        }
                    }).unwrap();
                    toast.success('Success', { description: 'Occasion updated successfully!' });
                } else {
                    const randomColors = ['#E74C3C', '#3498DB', '#2ECC71', '#F1C40F', '#9B59B6', '#E67E22', '#1ABC9C', '#34495E'];
                    const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)];
                    await createOccasion({
                        contactId: contactId!,
                        type,
                        date: date.toISOString(),
                        notes,
                        dotColor: randomColor,
                    }).unwrap();
                    dispatch(spendCoins(1));
                    toast.success('Success', { description: 'Occasion created successfully!' });
                }

                onSuccess?.();
                (ref as any)?.current?.close();
            } catch (err: any) {
                console.error(err);
                toast.error('Error', {
                    description: err?.data?.message || 'Failed to process request. Please try again.'
                });
            } finally {
                setIsSubmitting(false);
            }
        };

        const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
            if (Platform.OS === 'android') {
                setShowPicker(false);
            }
            if (selectedDate) {
                setDate(selectedDate);
            }
        };

        const handlePickContact = async () => {
            try {
                if (Platform.OS === 'android') {
                    const { status } = await Contacts.requestPermissionsAsync();
                    if (status !== 'granted') return;
                }
                const contact = await Contacts.presentContactPickerAsync();
                if (contact) {
                    const phone = contact.phoneNumbers?.[0]?.number;
                    const name = contact.name;

                    setContactName(name);
                    setContactNumber(phone ?? "");

                    const existingContact = contacts.find(c =>
                        (phone && c.phoneNumber === phone) || c.name === name
                    );

                    if (existingContact) {
                        setSelectedContactId(existingContact.id);
                    } else {
                        setSelectedContactId(undefined);
                    }
                }
            } catch (error) {
                console.log('Error picking contact', error);
            }
        };

        return (
            <BottomSheetWrapper
                ref={ref}
                snapPoints={['65%', '90%']}
                scrollable
                keyboardBehavior="interactive"
                android_keyboardInputMode="adjustPan"
            >
                <View style={{ paddingBottom: spacing.xl * 2 }}>
                    <Typography variant="h2" style={{ marginBottom: spacing.xs }}>
                        {isEditing ? 'Edit Occasion' : 'Create Occasion'}
                    </Typography>
                    {!isEditing && (
                        <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                            Add an occasion. This costs 1 coin.
                        </Typography>
                    )}

                    {isFetchingOccasion ? (
                        <View style={{ padding: spacing.xl * 2, alignItems: 'center' }}>
                            <ActivityIndicator color={colors.primary} size="large" />
                        </View>
                    ) : (
                        <View style={styles.form}>
                            {(fixedContactId || isEditing) ? (
                                <View style={{ marginBottom: spacing.md, padding: spacing.md, backgroundColor: colors.surfaceRaised, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
                                    <View>
                                        <Typography variant="bodyBold">{contactName}</Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>
                                            {isEditing ? 'Contact for this occasion' : 'Adding occasion for this contact'}
                                        </Typography>
                                    </View>
                                </View>
                            ) : (
                                <Pressable onPress={handlePickContact}>
                                    <View pointerEvents="none">
                                        <Input
                                            label="Contact"
                                            placeholder="Select a contact"
                                            value={contactName ? (contactNumber ? `${contactName} - ${contactNumber}` : contactName) : ""}
                                            isBottomSheet
                                            editable={false}
                                            rightIcon={
                                                <Pressable onPress={handlePickContact} style={{ padding: 4 }}>
                                                    <Ionicons
                                                        name={selectedContactId ? "checkmark-circle" : "person-add-outline"}
                                                        size={20}
                                                        color={selectedContactId ? colors.success : colors.textSecondary}
                                                    />
                                                </Pressable>
                                            }
                                        />
                                    </View>
                                    {selectedContactId && (
                                        <Typography variant="caption" color={colors.success} style={{ marginTop: -12, marginLeft: 4 }}>
                                            Linked to GiftSync Contact
                                        </Typography>
                                    )}
                                </Pressable>
                            )}

                            <View>
                                <Typography variant="label" style={{ marginBottom: 8, marginLeft: 4 }}>Type of occasion</Typography>
                                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                    {OCCASION_TYPES.map((t) => (
                                        <Pressable
                                            key={t}
                                            onPress={() => setType(t)}
                                            style={[
                                                styles.typeBtn,
                                                {
                                                    backgroundColor: type === t ? colors.primary : colors.surfaceRaised,
                                                    borderColor: type === t ? colors.primary : colors.border,
                                                    borderWidth: 1,
                                                }
                                            ]}
                                        >
                                            <Typography variant="caption" color={type === t ? '#FFFFFF' : colors.textPrimary}>
                                                {t}
                                            </Typography>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            <Pressable onPress={() => setShowPicker(true)}>
                                <View pointerEvents="none">
                                    <Input
                                        label="Date"
                                        placeholder="Select a date"
                                        value={formattedDate}
                                        onChangeText={() => { }}
                                        isBottomSheet
                                    />
                                </View>
                            </Pressable>

                            {showPicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                />
                            )}

                            <Input
                                label="Notes (Optional)"
                                placeholder="Add preferences, gift ideas, etc."
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                                numberOfLines={3}
                                isBottomSheet
                            />

                            <Button
                                title={isEditing ? 'Save Changes' : 'Create Occasion (1 Coin)'}
                                onPress={handleSubmit}
                                disabled={!contactName || !type || isSubmitting || externalLoading || isFetchingOccasion}
                                isLoading={isSubmitting || externalLoading || isFetchingOccasion}
                                style={{ marginTop: spacing.md }}
                            />
                        </View>
                    )}
                </View>
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    form: {
        gap: 20,
    },
    typeBtn: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
});

export default CreateOccasionSheet;
