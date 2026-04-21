import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

import { useGetContactsQuery } from '@/store/api/contactsApi';
import { useCreateOccasionMutation, useGetOccasionDetailQuery, useGetOccasionTemplatesQuery, useUpdateOccasionMutation } from '@/store/api/occasionApi';
import { spendCoins } from '@/store/slices/walletSlice';
import { Contact } from '@/types';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner-native';

interface OccasionFormProps {
    onSuccess?: () => void;
    onCompleted?: () => void;
    onBack?: () => void;
    isLoading?: boolean;
    isEditing?: boolean;
    occasionId?: string;
    fixedContactId?: string;
    fixedContactName?: string;
    fixedContactPhone?: string;
}

const OCCASION_TYPES = [
    { value: 'Birthday', label: 'Birthday', icon: 'gift-outline' },
    { value: 'Anniversary', label: 'Anniversary', icon: 'heart-outline' },
    { value: 'Custom', label: 'Custom', icon: 'star-outline' },
];

const INTERESTS_PRESETS = ['Tech', 'Fashion', 'Sports', 'Books', 'Cooking', 'Travel', 'Gaming'];

const OccasionForm: React.FC<OccasionFormProps> = ({
    onSuccess,
    onCompleted,
    onBack,
    isLoading: externalLoading,
    isEditing,
    occasionId,
    fixedContactId,
    fixedContactName,
    fixedContactPhone
}) => {
    const { spacing, colors } = useTheme();
    const dispatch = useDispatch();

    // Form State
    const [name, setName] = useState(fixedContactName || "");
    const [phone, setPhone] = useState(fixedContactPhone || "");
    const [title, setTitle] = useState("Birthday");
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Optional Details (Collapsed)
    const [isExpanded, setIsExpanded] = useState(false);
    const [interests, setInterests] = useState<string[]>([]);
    const [notes, setNotes] = useState("");
    const [customInterest, setCustomInterest] = useState("");

    // Contact Lookup State
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // API Hooks
    const { data: contactsData } = useGetContactsQuery({ page: 1, limit: 50 }, { skip: !!fixedContactId });
    const { data: templates } = useGetOccasionTemplatesQuery();
    const [createOccasion, { isLoading: isCreating }] = useCreateOccasionMutation();
    const [updateOccasion, { isLoading: isUpdating }] = useUpdateOccasionMutation();
    const { data: occasionDetail, isLoading: isDetailLoading } = useGetOccasionDetailQuery(occasionId as string, { skip: !isEditing || !occasionId });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtered Contacts for Smart Behavior
    const filteredContacts = useMemo(() => {
        if (!name || name.length < 2 || selectedContact || fixedContactId) return [];
        return (contactsData?.items || []).filter(c =>
            c.name.toLowerCase().includes(name.toLowerCase()) ||
            c.phoneNumber.includes(name)
        ).slice(0, 3);
    }, [name, contactsData, selectedContact, fixedContactId]);

    // Initial Load for Editing
    useEffect(() => {
        if (isEditing && occasionDetail) {
            setName(occasionDetail.contact?.name || "");
            setPhone(occasionDetail.contact?.phoneNumber || "");
            setTitle(occasionDetail.title);
            setDate(new Date(occasionDetail.date));
            if (occasionDetail.contact?.interests) setInterests(occasionDetail.contact.interests);
            if (occasionDetail.contact?.notes) setNotes(occasionDetail.contact.notes);
            setSelectedContact(occasionDetail.contact as Contact);
        }
    }, [isEditing, occasionDetail]);

    useEffect(() => {
        if (fixedContactId && contactsData?.items) {
            const c = contactsData.items.find(i => i.id === fixedContactId);
            if (c) {
                setSelectedContact(c);
                setName(c.name);
                setPhone(c.phoneNumber);
            }
        }
    }, [fixedContactId, contactsData]);

    const handleSelectContact = (contact: Contact) => {
        setSelectedContact(contact);
        setName(contact.name);
        setPhone(contact.phoneNumber);
        if (contact.interests) setInterests(contact.interests);
        setIsSearching(false);
    };

    const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    const toggleInterest = (interest: string) => {
        setInterests(prev =>
            prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
        );
    };

    const handleAddCustomInterest = () => {
        if (customInterest.trim() && !interests.includes(customInterest.trim())) {
            setInterests(prev => [...prev, customInterest.trim()]);
            setCustomInterest("");
        }
    };

    const handleSubmit = async () => {
        if (!name || !phone) {
            toast.error("Required Fields", { description: "Name and phone number are required." });
            return;
        }

        setIsSubmitting(true);
        try {
            let contactId = selectedContact?.id || fixedContactId;

            if (isEditing && occasionId) {
                await updateOccasion({
                    id: occasionId,
                    data: {
                        title,
                        date: date.toISOString(),
                        recurrenceType: 'YEARLY',
                    }
                }).unwrap();
                toast.success("Occasion Updated 🎉");
            } else {
                await createOccasion({
                    title,
                    date: date.toISOString(),
                    recurrenceType: 'YEARLY',
                    name,
                    phoneNumber: phone,
                    interests,
                    notes,
                }).unwrap();
                dispatch(spendCoins(1));
                toast.success("Occasion Added 🎉");
            }

            onSuccess?.();
            onCompleted?.();
        } catch (err: any) {
            console.error(err);
            toast.error("Error", { description: err?.data?.message || "Something went wrong" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isEditing && isDetailLoading) {
        return <ActivityIndicator style={{ padding: 40 }} color={colors.primary} />;
    }

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: spacing.xl * 2 }}
        >
            <View style={styles.container}>
                {/* Section 1: Basic Info */}
                <View style={styles.section}>
                    <Input
                        label="Who is this for?"
                        placeholder="Name of your contact"
                        value={name}
                        onChangeText={(val) => {
                            setName(val);
                            if (selectedContact && val !== selectedContact.name) {
                                setSelectedContact(null);
                            }
                        }}
                        isBottomSheet
                    />

                    {/* Smart Behavior: Contact Dropdown */}
                    {filteredContacts.length > 0 && (
                        <Animated.View entering={FadeIn} exiting={FadeOut} style={[styles.dropdown, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                            {filteredContacts.map(contact => (
                                <Pressable
                                    key={contact.id}
                                    onPress={() => handleSelectContact(contact)}
                                    style={styles.dropdownItem}
                                >
                                    <Avatar uri={contact.avatar} name={contact.name} size="sm" />
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Typography variant="bodyBold">{contact.name}</Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>{contact.phoneNumber}</Typography>
                                    </View>
                                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                                </Pressable>
                            ))}
                        </Animated.View>
                    )}

                    <Input
                        label="Phone Number"
                        placeholder="+234..."
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        isBottomSheet
                    />

                    <View style={{ marginTop: spacing.sm }}>
                        <Typography variant="label" style={{ marginBottom: spacing.xs }}>Occasion Type</Typography>
                        <View style={styles.chipsContainer}>
                            {OCCASION_TYPES.map(type => (
                                <Pressable
                                    key={type.value}
                                    onPress={() => setTitle(type.value)}
                                    style={[
                                        styles.chip,
                                        { backgroundColor: title === type.value ? colors.primary : colors.surfaceRaised },
                                        title === type.value && { borderColor: colors.primary }
                                    ]}
                                >
                                    <Ionicons name={type.icon as any} size={16} color={title === type.value ? "#FFF" : colors.textPrimary} />
                                    <Typography variant="caption" color={title === type.value ? "#FFF" : colors.textPrimary}>{type.label}</Typography>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {title === 'Custom' && (
                        <Input
                            placeholder="e.g. Graduation"
                            value={title === 'Custom' ? (isEditing ? title : '') : title}
                            onChangeText={setTitle}
                            isBottomSheet
                            style={{ marginTop: spacing.sm }}
                        />
                    )}

                    <Pressable onPress={() => setShowDatePicker(true)} style={{ marginTop: spacing.sm }}>
                        <View pointerEvents="none">
                            <Input
                                label="Date"
                                value={date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                leftIcon={<Ionicons name="calendar-outline" size={20} color={colors.textMuted} />}
                                isBottomSheet
                            />
                        </View>
                    </Pressable>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                        />
                    )}
                </View>

                {/* Section 3: Optional (Collapsed) */}
                <Pressable
                    onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setIsExpanded(!isExpanded);
                    }}
                    style={styles.expandHeader}
                >
                    <Typography variant="bodyBold" color={colors.primary}>
                        {isExpanded ? "Hide extra details" : "Add more details (Interests, Notes)"}
                    </Typography>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.primary} />
                </Pressable>

                {isExpanded && (
                    <Animated.View entering={FadeIn} style={styles.expandedContent}>
                        <View style={{ marginBottom: spacing.md }}>
                            <Typography variant="label" style={{ marginBottom: spacing.sm }}>Interests</Typography>
                            <View style={styles.chipsContainer}>
                                {INTERESTS_PRESETS.map(interest => (
                                    <Pressable
                                        key={interest}
                                        onPress={() => toggleInterest(interest)}
                                        style={[
                                            styles.chip,
                                            { backgroundColor: interests.includes(interest) ? colors.primary + '20' : colors.surfaceRaised },
                                            interests.includes(interest) && { borderColor: colors.primary }
                                        ]}
                                    >
                                        <Typography variant="caption" color={interests.includes(interest) ? colors.primary : colors.textPrimary}>{interest}</Typography>
                                    </Pressable>
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                                <Input
                                    placeholder="Add custom interest"
                                    value={customInterest}
                                    onChangeText={setCustomInterest}
                                    // containerStyle={{ flex: 1 }}
                                    isBottomSheet
                                />
                                <Button
                                    title="Add"
                                    onPress={handleAddCustomInterest}
                                    size="sm"
                                    style={{ height: 50 }}
                                />
                            </View>
                        </View>

                        <Input
                            label="Notes"
                            placeholder="Add anything important to remember..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={3}
                            isBottomSheet
                        />
                    </Animated.View>
                )}

                {/* Section 4: Submit */}
                <Button
                    title={isEditing ? "Save Changes" : "Save Occasion"}
                    onPress={handleSubmit}
                    isLoading={isSubmitting || isCreating || isUpdating}
                    disabled={!name || !phone || isSubmitting}
                    style={{ marginTop: spacing.xl }}
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 4,
    },
    section: {
        gap: 16,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 100,
        gap: 6,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    dropdown: {
        marginTop: -12,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        zIndex: 10,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    expandHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 8,
    },
    expandedContent: {
        gap: 16,
        paddingBottom: 10,
    }
});

export default OccasionForm;

