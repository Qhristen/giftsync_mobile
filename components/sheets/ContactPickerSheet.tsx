import { useTheme } from '@/hooks/useTheme';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Search01Icon } from '@hugeicons/core-free-icons';
import { forwardRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Input from '../ui/Input';
import Typography from '../ui/Typography';
import { moderateScale } from '@/utils/scaling';

interface Contact {
    id: string;
    name: string;
    relationship: string;
    avatarUrl?: string;
    nextEventPreview?: string;
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
                <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>YOUR PEOPLE FILE</Typography>
                <Typography variant="h2" style={{ marginBottom: spacing.sm }}>Who is this for?</Typography>
                <Input
                    placeholder="Search contacts..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    leftIcon={<HugeiconsIcon icon={Search01Icon} size={moderateScale(20)} color={colors.textMuted} />}
                    style={{ marginBottom: spacing.lg }}
                />

                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <Pressable
                            onPress={() => onSelect(item)}
                            style={({ pressed }) => [
                                styles.item,
                                { backgroundColor: [colors.lemon, colors.mint, colors.lavender][index % 3], borderColor: colors.ink, opacity: pressed ? 0.72 : 1 },
                            ]}
                        >
                            <Avatar uri={item.avatarUrl} name={item.name} size="md" />
                            <View style={styles.itemContent}>
                                <Typography variant="bodyBold">{item.name}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {item.relationship}
                                </Typography>
                            </View>
                            {item.nextEventPreview && (
                                <Badge label={item.nextEventPreview} size="xs" variant="amber" />
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
                    scrollEnabled={false}
                />
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(1) },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(12),
        gap: moderateScale(12),
        borderWidth: 1.25,
        borderRadius: moderateScale(17),
        marginBottom: moderateScale(9),
    },
    itemContent: {
        flex: 1,
    },
    sectionHeader: {
        paddingVertical: moderateScale(4),
    },
});

ContactPickerSheet.displayName = 'ContactPickerSheet';

export default ContactPickerSheet;
