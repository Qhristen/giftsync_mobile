import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { nextStep } from '@/store/slices/onboardingSlice';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';

interface Contact {
    id: string;
    name: string;
    phoneNumber?: string;
    selected: boolean;
}

export default function OnboardingStep2() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, spacing } = useTheme();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

    const requestPermission = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        setPermissionGranted(status === 'granted');
        if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
            });
            if (data.length > 0) {
                setContacts(data.map(c => ({
                    id: c.id,
                    name: c.name,
                    phoneNumber: c.phoneNumbers?.[0]?.number,
                    selected: false,
                })));
            }
        }
    };

    const toggleContact = (id: string) => {
        setContacts(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
    };

    const selectedCount = contacts.filter(c => c.selected).length;

    const groupedContacts = contacts.reduce((acc, contact) => {
        const firstLetter = contact.name[0]?.toUpperCase() || '#';
        if (!acc[firstLetter]) acc[firstLetter] = [];
        acc[firstLetter].push(contact);
        return acc;
    }, {} as Record<string, Contact[]>);

    const sections = Object.keys(groupedContacts)
        .sort()
        .map((letter) => ({
            title: letter,
            data: groupedContacts[letter],
        }));

    const onContinue = () => {
        dispatch(nextStep());
        router.push('/(auth)/onboarding/step-3-confirm-occasions');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm }]}>
                <ProgressBar progress={0.5} />
                <Typography variant="h2" style={{ marginTop: spacing.xl }}>
                    Import Contacts
                </Typography>
                <Typography variant="body" color={colors.textSecondary}>
                    Connect with people you care about.
                </Typography>
            </View>

            {permissionGranted === null || !permissionGranted ? (
                <View style={[styles.permissionContent, { padding: spacing.xl }]}>
                    <View style={styles.illustration}>
                        <Ionicons name="people-circle" size={120} color={colors.primary} />
                    </View>
                    <Typography variant="h3" align="center" style={{ marginBottom: spacing.sm }}>
                        GiftSync works better with friends.
                    </Typography>
                    <Typography variant="body" align="center" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                        We'll help you find birthdays and occasions for the people in your contact list.
                    </Typography>
                    <Button title="Continue to Contacts" onPress={requestPermission} />
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => toggleContact(item.id)}
                            style={({ pressed }) => [
                                styles.item,
                                { backgroundColor: pressed ? colors.surfaceRaised : 'transparent', paddingHorizontal: spacing.xl },
                            ]}
                        >
                            <Avatar name={item.name} size="sm" />
                            <View style={styles.itemContent}>
                                <Typography variant="bodyBold">{item.name}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {item.phoneNumber || 'No phone number'}
                                </Typography>
                            </View>
                            <View style={[styles.checkbox, { borderColor: item.selected ? colors.primary : colors.border, backgroundColor: item.selected ? colors.primary : 'transparent' }]}>
                                {item.selected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                            </View>
                        </Pressable>
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={[styles.sectionHeader, { backgroundColor: colors.background, paddingHorizontal: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border + '33' }]}>
                            <Typography variant="label" color={colors.primary} style={{ paddingTop: spacing.md, paddingBottom: spacing.xs }}>
                                {title}
                            </Typography>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {permissionGranted && (
                <View style={[styles.footer, { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border }]}>
                    <Button
                        title={selectedCount > 0 ? `Import ${selectedCount} Contacts` : 'Skip for now'}
                        onPress={onContinue}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 80,
    },
    permissionContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    illustration: {
        marginBottom: 40,
        opacity: 0.8,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    itemContent: {
        flex: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        paddingVertical: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF', // Need to make this responsive to theme if not careful
    },
});
