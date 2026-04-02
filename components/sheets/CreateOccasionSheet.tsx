import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Contacts from 'expo-contacts';
import React, { forwardRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

export interface OccasionFormData {
    type: string;
    date: string; // ISO string
    contactAvatar: string;
    contactName: string;
    contactNumber: string;
    notes?: string;
}

const OCCASION_TYPES = [
    'Birthday',
    'Anniversary',
    'Graduation',
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
    onSubmit: (data: OccasionFormData) => void;
    isLoading?: boolean;
}

const CreateOccasionSheet = forwardRef<BottomSheetRef, Props>(
    ({ onSubmit, isLoading }, ref) => {
        const { spacing, colors } = useTheme();
        const [type, setType] = useState<OccasionFormData['type']>('Other');
        const [date, setDate] = useState(new Date());
        const [showPicker, setShowPicker] = useState(false);
        const [contactAvatar, setContactAvatar] = useState("");
        const [contactName, setContactName] = useState("");
        const [contactNumber, setContactNumber] = useState("");
        const [notes, setNotes] = useState("");

        const formattedDate = date.toLocaleString('default', { month: 'long', day: 'numeric' });

        const handleSubmit = () => {
            onSubmit({
                contactAvatar,
                contactName,
                contactNumber,
                type,
                date: date.toISOString(),
                notes
            });
            // setContactName('');
            // setContactAvatar('');
            // setContactNumber('');
            // setType('Other');
            // setDate(new Date());
            // setNotes('');
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
                    console.log("phone", phone);
                    const text = phone ? `${contact.name} - ${phone}` : contact.name;
                    setContactAvatar(contact.image?.uri || "");
                    setContactName(contact.name);
                    setContactNumber(phone ?? "");
                }
            } catch (error) {
                console.log('Error picking contact', error);
            }
        };

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['65%', '85%']} scrollable keyboardBehavior="fillParent" android_keyboardInputMode="adjustResize">
                <View>
                    <Typography variant="h2" style={{ marginBottom: spacing.xs }}>
                        Create Occasion
                    </Typography>
                    <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                        Add an occasion. This costs 1 coin.
                    </Typography>

                    <View style={styles.form}>
                        <Pressable onPress={handlePickContact}>
                            <View pointerEvents="none">
                                <Input
                                    label="Contact"
                                    placeholder="Select a contact"
                                    value={contactNumber ? `${contactName} - ${contactNumber}` : contactName}
                                    onChangeText={() => { }}
                                    isBottomSheet
                                    rightIcon={
                                        <View style={{ padding: 4 }}>
                                            <Ionicons name="person-add-outline" size={20} color={colors.textSecondary} />
                                        </View>
                                    }
                                />
                            </View>
                        </Pressable>

                        <View>
                            <Typography variant="label" style={{ marginBottom: 8, marginLeft: 4 }}>Type of occation</Typography>
                            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                {OCCASION_TYPES.map((t) => (
                                    <Pressable
                                        key={t}
                                        onPress={() => setType(t)}
                                        style={({ pressed }) => [
                                            styles.typeBtn,
                                            {
                                                backgroundColor: type === t ? colors.primary : colors.surfaceRaised,
                                                borderColor: type === t ? colors.primary : colors.border,
                                                borderWidth: 1,
                                            },
                                            pressed && { opacity: 0.8 }
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
                            title="Create Occasion (1 Coin)"
                            onPress={handleSubmit}
                            disabled={!contactName || !type || isLoading}
                            isLoading={isLoading}
                            style={{ marginTop: spacing.md }}
                        />
                    </View>
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
