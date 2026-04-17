import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

import { useCreateContactMutation, useUpdateContactMutation } from '@/store/api/contactsApi';
import { Contact } from '@/types';

const RELATIONSHIP_TYPES = [
    'Partner',
    'Friend',
    'Parent',
    'Sibling',
    'Colleague',
    'Uncle',
    'Auntie',
    'Cousin'
] as const;

const BUDGET_OPTIONS = [
    { label: 'Low', value: 'LOW' },
    { label: 'Mid', value: 'MID' },
    { label: 'High', value: 'HIGH' }
] as const;

const INTEREST_OPTIONS = [
    'music', 'fashion', 'fitness', 'skincare', 'gaming', 'cooking', 'art', 'tech', 'travel'
] as const;

interface ContactFormProps {
    onSuccess?: (contactId: string, contact?: Contact) => void;
    initialData?: Partial<Contact>;
    isEditing?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSuccess, initialData, isEditing }) => {
    const { spacing, colors } = useTheme();
    const [createContact, { isLoading: isCreating }] = useCreateContactMutation();
    const [updateContact, { isLoading: isUpdating }] = useUpdateContactMutation();

    const isLoading = isCreating || isUpdating;

    const [name, setName] = useState(initialData?.name || "");
    const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || "");
    const [avatar, setAvatar] = useState(initialData?.avatar || "");
    const [relationship, setRelationship] = useState<string | undefined>(initialData?.relationship || 'Other');
    const [budget, setBudget] = useState<Contact['budget']>(initialData?.budget);
    const [interests, setInterests] = useState<string[]>(initialData?.interests || []);
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [source, setSource] = useState(initialData?.source || "manual");

    React.useEffect(() => {
        if (initialData) {
            setName(initialData.name || "");
            setPhoneNumber(initialData.phoneNumber || "");
            setAvatar(initialData.avatar || "");
            setRelationship(initialData.relationship || 'Other');
            setBudget(initialData.budget);
            setInterests(initialData.interests || []);
            setNotes(initialData.notes || "");
            setSource(initialData.source || "manual");
        }
    }, [initialData]);

    const handlePickContact = async () => {
        try {
            if (Platform.OS === 'android') {
                const { status } = await Contacts.requestPermissionsAsync();
                if (status !== 'granted') return;
            }
            const contact = await Contacts.presentContactPickerAsync();
            if (contact) {
                setName(contact.name);
                setPhoneNumber(contact.phoneNumbers?.[0]?.number || "");
                setAvatar(contact.image?.uri || "");
            }
        } catch (error) {
            console.log('Error picking contact', error);
        }
    };

    const handleSubmit = async () => {
        try {
            if (isEditing && initialData?.id) {
                const updatedContact = await updateContact({
                    id: initialData.id,
                    data: {
                        name: name.trim(),
                        phoneNumber: phoneNumber.trim(),
                        avatar,
                        relationship,
                        budget,
                        interests,
                        notes: notes.trim(),
                        source,
                    }
                }).unwrap();

                toast.success('Success', { description: 'Contact updated successfully!' });
                onSuccess?.(updatedContact.id, updatedContact);
            } else {
                const newContact = await createContact({
                    name: name.trim(),
                    phoneNumber: phoneNumber.trim(),
                    avatar,
                    relationship,
                    budget,
                    interests,
                    notes: notes,
                    source,
                }).unwrap();

                toast.success('Success', { description: 'Contact added successfully!' });
                onSuccess?.(newContact.id, newContact);
            }

            if (!isEditing) {
                // Reset form only on create
                setName("");
                setPhoneNumber("");
                setAvatar("");
                setInterests([]);
                setNotes("");
                setSource("manual");
            }
        } catch (err: any) {
            console.log(err)
            toast.error('Error', {
                description: err?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} contact.`
            });
        }
    };

    return (
        <View style={{ paddingBottom: spacing.xl * 2 }}>
            <Typography variant="h2" style={{ marginBottom: spacing.xs }}>
                {isEditing ? 'Edit Contact' : 'Add New Contact'}
            </Typography>
            <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                {isEditing ? 'Update your contact details and preferences.' : 'Link a friend or family member to start managing their occasions.'}
            </Typography>

            <View style={styles.form}>
                <Button
                    title="Pick from Phone"
                    variant="outline"
                    onPress={handlePickContact}
                    leftIcon={<Ionicons name="person-add-outline" size={20} color={colors.primary} />}
                />

                <Input
                    label="Name"
                    placeholder="Full name"
                    value={name}
                    onChangeText={setName}
                    isBottomSheet
                />

                <Input
                    label="Phone Number"
                    placeholder="e.g +234..."
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    isBottomSheet
                    keyboardType="phone-pad"
                />

                <View>
                    <Typography variant="label" style={{ marginBottom: 8, marginLeft: 4 }}>Relationship</Typography>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                        {RELATIONSHIP_TYPES.map((r) => (
                            <Pressable
                                key={r}
                                onPress={() => setRelationship(r)}
                                style={[
                                    styles.typeBtn,
                                    {
                                        backgroundColor: relationship === r ? colors.primary : colors.surfaceRaised,
                                        borderColor: relationship === r ? colors.primary : colors.border,
                                        borderWidth: 1,
                                    }
                                ]}
                            >
                                <Typography variant="caption" color={relationship === r ? '#FFFFFF' : colors.textPrimary}>
                                    {r}
                                </Typography>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View>
                    <Typography variant="label" style={{ marginBottom: 8, marginLeft: 4 }}>Preferred Budget</Typography>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        {BUDGET_OPTIONS.map((b) => (
                            <Pressable
                                key={b.value}
                                onPress={() => setBudget(b.value)}
                                style={[
                                    styles.typeBtn,
                                    {
                                        flex: 1,
                                        backgroundColor: budget === b.value ? colors.primary : colors.surfaceRaised,
                                        borderColor: budget === b.value ? colors.primary : colors.border,
                                        borderWidth: 1,
                                        alignItems: 'center'
                                    }
                                ]}
                            >
                                <Typography variant="caption" color={budget === b.value ? '#FFFFFF' : colors.textPrimary}>
                                    {b.label}
                                </Typography>
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View>
                    <Typography variant="label" style={{ marginBottom: 8, marginLeft: 4 }}>Interests</Typography>
                    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                        {INTEREST_OPTIONS.map((i) => {
                            const isSelected = interests.includes(i);
                            return (
                                <Pressable
                                    key={i}
                                    onPress={() => {
                                        if (isSelected) {
                                            setInterests(interests.filter(item => item !== i));
                                        } else {
                                            setInterests([...interests, i]);
                                        }
                                    }}
                                    style={[
                                        styles.typeBtn,
                                        {
                                            backgroundColor: isSelected ? colors.primary : colors.surfaceRaised,
                                            borderColor: isSelected ? colors.primary : colors.border,
                                            borderWidth: 1,
                                        }
                                    ]}
                                >
                                    <Typography variant="caption" color={isSelected ? '#FFFFFF' : colors.textPrimary}>
                                        {i.charAt(0).toUpperCase() + i.slice(1)}
                                    </Typography>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <Input
                    label="Notes (Optional)"
                    placeholder="Add generic notes, sizes, address, etc."
                    value={notes}
                    onChangeText={setNotes}
                    isBottomSheet
                    multiline
                    numberOfLines={3}
                />

                <Button
                    title={isEditing ? "Update Contact" : "Save Contact"}
                    onPress={handleSubmit}
                    disabled={!name || isLoading}
                    isLoading={isLoading}
                    style={{ marginTop: spacing.md }}
                />
            </View>
        </View>
    );
};

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

export default ContactForm;
