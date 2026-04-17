import { useTheme } from '@/hooks/useTheme';
import { useGetUpcomingOccasionsQuery } from '@/store/api/occasionApi';
import { Contact } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

interface Props {
    contact?: Contact | null;
    onAddOccasion: (contact: Contact) => void;
    onEditOccasion: (occasionId: string) => void;
    onClose?: () => void;
}

const ContactDetailSheet = forwardRef<BottomSheetRef, Props>(
    ({ contact, onAddOccasion, onEditOccasion, onClose }, ref) => {
        const { spacing, colors } = useTheme();
        const { data: allOccasions = [] } = useGetUpcomingOccasionsQuery();

        const contactOccasions = allOccasions.filter(o => o.contactId === contact?.id);

        return (
            <BottomSheetWrapper
                ref={ref}
                snapPoints={['60%', '90%']}
                scrollable
                onClose={onClose}
            >
                {contact ? (
                    <View style={{ paddingBottom: spacing.xl * 2 }}>
                        <View style={styles.header}>
                            <Avatar uri={contact.avatar} name={contact.name} size="xl" />
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Typography variant="h2">{contact.name}</Typography>
                                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                                    <Badge label={contact.relationship || 'Other'} variant="primary" size="xs" />
                                    <Badge label={`${contact.budget || 'MID'} Budget`} variant="secondary" size="xs" />
                                </View>
                            </View>
                        </View>

                        <View style={styles.interestsContainer}>
                            <Typography variant="label" style={{ marginBottom: 8 }}>Interests</Typography>
                            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                                {contact.interests?.map((interest) => (
                                    <Badge key={interest} label={interest} outline size="xs" />
                                ))}
                                {(!contact.interests || contact.interests.length === 0) && (
                                    <Typography variant="caption" color={colors.textSecondary}>No interests added</Typography>
                                )}
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <View style={styles.occasionsHeader}>
                            <Typography variant="h4">Occasions</Typography>
                            <Button
                                title="Add"
                                size="sm"
                                variant="primary"
                                onPress={() => onAddOccasion(contact)}
                                leftIcon={<Ionicons name="add" size={16} color="#FFF" />}
                            />
                        </View>

                        {contactOccasions.length > 0 ? (
                            <FlatList
                                data={contactOccasions}
                                keyExtractor={(item) => item.id}
                                scrollEnabled={false}
                                renderItem={({ item }) => (
                                    <Pressable
                                        onPress={() => onEditOccasion(item.id)}
                                        style={({ pressed }) => [
                                            styles.occasionItem,
                                            { backgroundColor: pressed ? colors.surfaceRaised : 'transparent' }
                                        ]}
                                    >
                                        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                                        <View style={{ flex: 1 }}>
                                            <Typography variant="bodyBold">{item.title}</Typography>
                                            <Typography variant="caption" color={colors.textSecondary}>
                                                {new Date(item.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </Typography>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                                    </Pressable>
                                )}
                            />
                        ) : (
                            <View style={styles.emptyState}>
                                <Typography variant="body" color={colors.textSecondary}>No occasions found for this contact.</Typography>
                            </View>
                        )}
                    </View>
                ) : null}
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    interestsContainer: {
        marginBottom: 24,
    },
    divider: {
        height: 1,
        marginBottom: 24,
    },
    occasionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    occasionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        gap: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    emptyState: {
        padding: 24,
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.02)',
    }
});

export default ContactDetailSheet;
