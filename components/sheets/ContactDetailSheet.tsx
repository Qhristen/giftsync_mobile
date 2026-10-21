import { useTheme } from '@/hooks/useTheme';
import { useGetEventTemplatesQuery, useGetUpcomingEventsQuery, useSubscribeToTemplateMutation } from '@/store/api/event';
import { Contact } from '@/types';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    Add01Icon,
    Calendar01Icon,
    ArrowRight01Icon,
    CheckmarkCircle02Icon,
    PlusSignCircleIcon,
} from '@hugeicons/core-free-icons';
import { forwardRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';
import { moderateScale } from '@/utils/scaling';

interface Props {
    contact?: Contact | null;
    onAddEvent: (contact: Contact) => void;
    onEditEvent: (occasionId: string) => void;
    onClose?: () => void;
}

const ContactDetailSheet = forwardRef<BottomSheetRef, Props>(
    ({ contact, onAddEvent, onEditEvent, onClose }, ref) => {
        const { spacing, colors } = useTheme();
        const { data: allEvents = [] } = useGetUpcomingEventsQuery();
        const { data: templates = [] } = useGetEventTemplatesQuery();
        const [subscribe] = useSubscribeToTemplateMutation();

        const contactEvents = allEvents.filter(o => o.contactId === contact?.id);

        // Find which templates this contact is subscribed to
        const subscribedTemplateIds = contactEvents
            .filter(o => o.templateId)
            .map(o => o.templateId);

        const handleToggleHoliday = async (templateId: string, isSubscribed: boolean) => {
            if (isSubscribed) {
                toast.info("Unsubscribe", { description: "Please delete the event manually from the list below." });
                return;
            }
            if (!contact) return;

            try {
                await subscribe({
                    templateId,
                    contactIds: [contact.id]
                }).unwrap();
                toast.success("Subscribed! 🎉");
            } catch {
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
                            <View style={{ flex: 1, marginLeft: moderateScale(16) }}>
                                <Typography variant="h2">{contact.name}</Typography>
                                <Typography variant="body" color={colors.textSecondary}>{contact.phoneNumber}</Typography>
                            </View>
                        </View>

                        {/* Interests */}
                        <View style={styles.section}>
                            <Typography variant="label" style={{ marginBottom: moderateScale(12) }}>Gift Interests</Typography>
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
                            <Typography variant="label" style={{ marginBottom: moderateScale(12) }}>Holiday Subscriptions</Typography>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: moderateScale(12) }}>
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
                                            <HugeiconsIcon
                                                icon={isSubscribed ? CheckmarkCircle02Icon : PlusSignCircleIcon}
                                                size={moderateScale(20)}
                                                color={isSubscribed ? colors.primary : colors.textMuted}
                                            />
                                            <Typography variant="caption" color={isSubscribed ? colors.primary : colors.textPrimary}>{tmpl.title}</Typography>
                                        </Pressable>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Events List */}
                        <View style={styles.occasionsHeader}>
                            <Typography variant="h4">Tracked Events</Typography>
                            <Button
                                title="Add New"
                                size="sm"
                                variant="outline"
                                onPress={() => onAddEvent(contact)}
                                leftIcon={<HugeiconsIcon icon={Add01Icon} size={moderateScale(16)} color={colors.primary} />}
                            />
                        </View>

                        {contactEvents.length > 0 ? (
                            <View style={styles.listContainer}>
                                {contactEvents.map((item) => (
                                    <Pressable
                                        key={item.id}
                                        onPress={() => onEditEvent(item.id)}
                                        style={({ pressed }) => [
                                            styles.occasionItem,
                                            { backgroundColor: pressed ? colors.surfaceRaised : 'transparent' }
                                        ]}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: colors.primary + '10' }]}>
                                            <HugeiconsIcon icon={Calendar01Icon} size={moderateScale(18)} color={colors.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Typography variant="bodyBold">{item.title}</Typography>
                                            <Typography variant="caption" color={colors.textSecondary}>
                                                {new Date(item.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                            </Typography>
                                        </View>
                                        <HugeiconsIcon icon={ArrowRight01Icon} size={moderateScale(18)} color={colors.textMuted} />
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
        marginBottom: moderateScale(24),
    },
    section: {
        marginBottom: moderateScale(24),
    },
    chipsContainer: {
        flexDirection: 'row',
        gap: moderateScale(8),
        flexWrap: 'wrap',
    },
    holidayCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: moderateScale(16),
        paddingVertical: moderateScale(10),
        borderRadius: moderateScale(100),
        gap: moderateScale(8),
    },
    divider: {
        height: moderateScale(1),
        marginBottom: moderateScale(24),
        opacity: 0.5,
    },
    occasionsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateScale(16),
    },
    listContainer: {
        gap: moderateScale(4),
    },
    occasionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(12),
        borderRadius: moderateScale(16),
        gap: moderateScale(16),
    },
    iconBox: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        padding: moderateScale(32),
        alignItems: 'center',
        borderRadius: moderateScale(20),
        backgroundColor: 'rgba(0,0,0,0.02)',
    }
});

ContactDetailSheet.displayName = 'ContactDetailSheet';

export default ContactDetailSheet;
