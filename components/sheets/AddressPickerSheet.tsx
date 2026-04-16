import { useTheme } from '@/hooks/useTheme';
import { useCreateAddressMutation, useDeleteAddressMutation, useGetAddressesQuery, useUpdateAddressMutation } from '@/store/api/addressApi';
import { Address } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import React, { forwardRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

interface Props {
    selectedAddressId?: string;
    onSelect: (address: Address) => void;
}

const AddressPickerSheet = forwardRef<BottomSheetRef, Props>(
    ({ selectedAddressId, onSelect }, ref) => {
        const { spacing, colors } = useTheme();

        const { data: addresses = [], isLoading } = useGetAddressesQuery();
        const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
        const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
        const [deleteAddress] = useDeleteAddressMutation();

        const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
        const [editingId, setEditingId] = useState<string | null>(null);

        // Form state
        const [recipientName, setRecipientName] = useState('');
        const [line1, setLine1] = useState('');
        const [line2, setLine2] = useState('');
        const [city, setCity] = useState('');
        const [stateName, setStateName] = useState('');
        const [country, setCountry] = useState('Nigeria');
        const [phone, setPhone] = useState('');

        const resetForm = () => {
            setRecipientName('');
            setLine1('');
            setLine2('');
            setCity('');
            setStateName('');
            setCountry('Nigeria');
            setPhone('');
            setEditingId(null);
        };

        const handleSave = async () => {
            if (!recipientName || !line1 || !city || !stateName || !phone) return;

            const payload = {
                recipientName,
                line1,
                line2,
                city,
                state: stateName,
                country,
                phone,
            };

            try {
                if (mode === 'edit' && editingId) {
                    await updateAddress({ id: editingId, data: payload }).unwrap();
                } else {
                    await createAddress(payload).unwrap();
                }
                setMode('list');
                resetForm();
            } catch (err) {
                console.error('Failed to save address:', err);
                alert('Failed to save address');
            }
        };

        const handleEdit = (addr: Address) => {
            setRecipientName(addr.recipientName);
            setLine1(addr.line1);
            setLine2(addr.line2 || '');
            setCity(addr.city);
            setStateName(addr.state);
            setCountry(addr.country);
            setPhone(addr.phone);
            setEditingId(addr.id || null);
            setMode('edit');
        };

        const handleDelete = async (id: string) => {
            try {
                await deleteAddress(id).unwrap();
            } catch (err) {
                console.error('Failed to delete address:', err);
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
                    const phoneNumber = contact.phoneNumbers?.[0]?.number;
                    setRecipientName(contact.name);
                    if (phoneNumber) setPhone(phoneNumber);
                }
            } catch (error) {
                console.log('Error picking contact', error);
            }
        };

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['80%']} scrollable keyboardBehavior="interactive"
                android_keyboardInputMode="adjustPan">
                {mode === 'list' ? (
                    <View style={{ flex: 1, paddingBottom: spacing.xl }}>
                        <View style={styles.header}>
                            <Typography variant="h2">Select Address</Typography>
                            <Button title="Add New" size="sm" variant="ghost" onPress={() => { resetForm(); setMode('create'); }} />
                        </View>
                        <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.lg }}>
                            Choose a delivery address for this recipient.
                        </Typography>

                        {isLoading ? (
                            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
                        ) : (
                            <View style={styles.list}>
                                {addresses.map((addr) => {
                                    const renderLeftActions = () => (
                                        <View style={[styles.swipeAction, { backgroundColor: colors.primary }]}>
                                            <Ionicons name="create" size={24} color="#FFF" />
                                            <Typography variant="caption" color="#FFF">Edit</Typography>
                                        </View>
                                    );

                                    const renderRightActions = () => (
                                        <View style={[styles.swipeAction, { backgroundColor: colors.error }]}>
                                            <Ionicons name="trash" size={24} color="#FFF" />
                                            <Typography variant="caption" color="#FFF">Delete</Typography>
                                        </View>
                                    );

                                    return (
                                        <Swipeable
                                            key={addr.id}
                                            renderLeftActions={renderLeftActions}
                                            renderRightActions={renderRightActions}
                                            onSwipeableOpen={(direction) => {
                                                if (direction === 'left') {
                                                    // This is swipe right (left actions)
                                                    handleEdit(addr);
                                                } else if (direction === 'right') {
                                                    // This is swipe left (right actions)
                                                    addr.id && handleDelete(addr.id);
                                                }
                                            }}
                                            containerStyle={styles.swipeContainer}
                                        >
                                            <Pressable
                                                onPress={() => onSelect(addr)}
                                                style={[
                                                    styles.item,
                                                    {
                                                        borderColor: selectedAddressId === addr.id ? colors.primary : colors.border,
                                                        backgroundColor: colors.surface
                                                    }
                                                ]}
                                            >
                                                <View style={styles.itemContent}>
                                                    <Typography variant="bodyBold">{addr.recipientName}</Typography>
                                                    <Typography variant="caption" color={colors.textSecondary}>
                                                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state}, {addr.country}. {addr.phone}
                                                    </Typography>
                                                </View>
                                                {selectedAddressId === addr.id && (
                                                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                                )}
                                            </Pressable>
                                        </Swipeable>
                                    );
                                })}
                                {addresses.length === 0 && (
                                    <Typography variant="body" color={colors.textMuted} style={{ textAlign: 'center', marginTop: spacing.xl }}>
                                        No addresses found. Add a new one.
                                    </Typography>
                                )}
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={{ flex: 1, paddingBottom: spacing.xl }}>
                        <View style={styles.header}>
                            <Pressable onPress={() => { resetForm(); setMode('list'); }}>
                                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                            </Pressable>
                            <Typography variant="h2">{mode === 'edit' ? 'Edit Address' : 'New Address'}</Typography>
                        </View>

                        <View style={{ gap: spacing.md, marginTop: spacing.md }}>
                            <Button
                                title="Pick from Contacts"
                                variant="outline"
                                onPress={handlePickContact}
                                leftIcon={<Ionicons name="person-add-outline" size={18} color={colors.primary} style={{ marginRight: 8 }} />}
                            />

                            <Input label="Recipient Name" value={recipientName} onChangeText={setRecipientName} placeholder="Alex Johnson" editable={false} isBottomSheet />
                            <Input label="Phone Number" value={phone} onChangeText={setPhone} placeholder="+234 810 000 0000" keyboardType="phone-pad" editable={false} isBottomSheet />
                            <Input label="Address Line 1" value={line1} onChangeText={setLine1} placeholder="123 Victoria Island" isBottomSheet />
                            <Input label="Address Line 2 (Optional)" value={line2} onChangeText={setLine2} placeholder="Apt 4B" isBottomSheet />
                            <View style={{ flexDirection: 'row', gap: spacing.md }}>
                                <View style={{ flex: 1 }}><Input label="City" value={city} onChangeText={setCity} placeholder="Lagos" isBottomSheet /></View>
                                <View style={{ flex: 1 }}><Input label="State" value={stateName} onChangeText={setStateName} placeholder="Lagos State" isBottomSheet /></View>
                            </View>
                            <Input label="Country" value={country} onChangeText={setCountry} placeholder="Nigeria" isBottomSheet />

                            <Button
                                title={mode === 'edit' ? "Update Address" : "Save Address"}
                                onPress={handleSave}
                                isLoading={isCreating || isUpdating}
                                style={{ marginTop: spacing.lg }}
                            />
                        </View>
                    </View>
                )}
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    list: {
        gap: 16,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderWidth: 1,
        borderRadius: 12,
        gap: 12,
    },
    itemContent: {
        flex: 1,
    },
    swipeContainer: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    swipeAction: {
        width: 80,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
    },
});

export default AddressPickerSheet;
