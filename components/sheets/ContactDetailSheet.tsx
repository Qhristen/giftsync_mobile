import { useTheme } from '@/hooks/useTheme';
import { useGetOccasionTemplatesQuery, useGetUpcomingOccasionsQuery, useSubscribeToTemplateMutation } from '@/store/api/occasionApi';
import { Contact } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';
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
        const { data: templates = [] } = useGetOccasionTemplatesQuery();
        const [subscribe] = useSubscribeToTemplateMutation();

        const contactOccasions = allOccasions.filter(o => o.contactId === contact?.id);

        // Find which templates this contact is subscribed to
        const subscribedTemplateIds = contactOccasions
            .filter(o => o.templateId)
            .map(o => o.templateId);

        const handleToggleHoliday = async (templateId: string, isSubscribed: boolean) => {
            if (isSubscribed) {
                toast.info("Unsubscribe", { description: "Please delete the occasion manually from the list below." });
                return;
            }
            if (!contact) return;

            try {
                await subscribe({
                    templateId,
                    contactId: contact.id
                }).unwrap();
                toast.success("Subscribed! 🎉");
            } catch (err) {
                toast.error("Error", { description: "Failed to subscribe." });
            }
        };

        return (
            <BottomSheetWrapper
                ref={ref}
                snapPoints={['70%', '95%']}
                scrollable
                onClose={onClose}
            >
                {contact ? (
                    <View style={{ paddingBottom: spacing.xl * 2 }}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Avatar uri={contact.avatar} name={contact.name} size="xl" />
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Typography variant="h2">{contact.name}</Typography>
                                <Typography variant="body" color={colors.textSecondary}>{contact.phoneNumber}</Typography>
                            </View>
                        </View>

                        {/* Interests */}
                        <View style={styles.section}>
                            <Typography variant="label" style={{ marginBottom: 12 }}>Gift Interests</Typography>
                            <View style={styles.chipsContainer}>
                                {contact.interests?.map((interest) => (
                                    <Badge key={interest} label={interest} outline variant="primary" />
                                ))}
                                {(!contact.interests || contact.interests.length === 0) && (
                                    <Typography variant="caption" color={colors.textSecondary}>No interests added yet.</Typography>
                                )}
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Subscribed Holidays */}
                        <View style={styles.section}>
                            <Typography variant="label" style={{ marginBottom: 12 }}>Holiday Subscriptions</Typography>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {templates.slice(0, 5).map((tmpl) => {
                                    const isSubscribed = subscribedTemplateIds.includes(tmpl.id);
                                    return (
                                        <Pressable
                                            key={tmpl.id}
                                            onPress={() => handleToggleHoliday(tmpl.id, !!isSubscribed)}
                                            style={[
                                                styles.holidayCard,
                                                { backgroundColor: isSubscribed ? colors.primary + '15' : colors.surfaceRaised }
                                            ]}
                                        >
                                            <Ionicons
                                                name={isSubscribed ? "checkmark-circle" : "add-circle-outline"}
                                                size={20}
                                                color={isSubscribed ? colors.primary : colors.textMuted}
                                            />
                                            <Typography variant="caption" color={isSubscribed ? colors.primary : colors.textPrimary}>{tmpl.title}</Typography>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Occasions List */}
                        <View style={styles.occasionsHeader}>
                            <Typography variant="h4">Tracked Occasions</Typography>
                            <Button
                                title="Add New"
                                size="sm"
                                variant="outline"
                                onPress={() => onAddOccasion(contact)}
                                leftIcon={<Ionicons name="add" size={16} color={colors.primary} />}
                            />
                        </View>

                        {contactOccasions.length > 0 ? (
                            <View style={styles.listContainer}>
                                {contactOccasions.map((item) => (
                                    <Pressable
                                        key={item.id}
                                        onPress={() => onEditOccasion(item.id)}
                                        style={({ pressed }) => [
                                            styles.occasionItem,
                                            { backgroundColor: pressed ? colors.surfaceRaised : 'transparent' }
                                        ]}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
                                            <Ionicons name="calendar" size={18} color={colors.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Typography variant="bodyBold">{item.title}</Typography>
                                            <Typography variant="caption" color={colors.textSecondary}>
                                                {new Date(item.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                            </Typography>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                                    </Pressable>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Typography variant="body" color={colors.textSecondary}>No occasions found.</Typography>
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
    section: {
        marginBottom: 24,
    },
    chipsContainer: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    holidayCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 100,
        gap: 8,
    },
    divider: {
        height: 1,
        marginBottom: 24,
        opacity: 0.5,
    },
    occasionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    listContainer: {
        gap: 4,
    },
    occasionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 16,
        gap: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.02)',
    }
});

export default ContactDetailSheet;
