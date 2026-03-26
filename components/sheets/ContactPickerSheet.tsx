import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

interface Contact {
    id: string;
    name: string;
    relationship: string;
    avatarUrl?: string;
    nextOccasionPreview?: string;
}

interface Props {
    contacts: Contact[];
    onSelect: (contact: Contact) => void;
    isLoading?: boolean;
}

const ContactPickerSheet = forwardRef<BottomSheetRef, Props>(
    ({ contacts, onSelect, isLoading }, ref) => {
        const { spacing, colors } = useTheme();
        const [searchQuery, setSearchQuery] = useState('');

        const filteredContacts = contacts.filter((c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const groupedContacts = filteredContacts.reduce((acc, contact) => {
            const firstLetter = contact.name[0].toUpperCase();
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

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['75%']} scrollable>
                <Typography variant="h2" style={{ marginBottom: spacing.sm }}>
                    Who is this for?
                </Typography>
                <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    leftIcon={<Ionicons name="search" size={20} color={colors.textMuted} />}
                    style={{ marginBottom: spacing.lg }}
                />

                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => onSelect(item)}
                            style={({ pressed }) => [
                                styles.item,
                                { backgroundColor: pressed ? colors.surfaceRaised : 'transparent' },
                            ]}
                        >
                            <Avatar uri={item.avatarUrl} name={item.name} size="md" />
                            <View style={styles.itemContent}>
                                <Typography variant="bodyBold">{item.name}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {item.relationship}
                                </Typography>
                            </View>
                            {item.nextOccasionPreview && (
                                <Badge label={item.nextOccasionPreview} size="xs" variant="amber" />
                            )}
                        </Pressable>
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={[styles.sectionHeader, { backgroundColor: colors.surface }]}>
                            <Typography variant="label" color={colors.primary}>
                                {title}
                            </Typography>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: spacing.xl }}
                    scrollEnabled={false} // SectionList handles its own scroll when used inside BottomSheetScrollView correctly usually, but we are inside BottomSheetWrapper which has Container as BottomSheetScrollView when if scrollable=true. Wait, standard BottomSheet actually provides BottomSheetSectionList.
                />
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    itemContent: {
        flex: 1,
    },
    sectionHeader: {
        paddingVertical: 4,
    },
});

export default ContactPickerSheet;
