import Avatar from '@/components/ui/Avatar';
import BottomSheetWrapper, { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetContactsQuery } from '@/store/api/contactsApi';
import { useGetOccasionTemplatesQuery, useSubscribeToTemplateMutation } from '@/store/api/occasionApi';
import { spacing } from '@/theme';
import { OccasionTemplate } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { toast } from 'sonner-native';

export default function GlobalOccasionsScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const { data: templates, isLoading: isTemplatesLoading } = useGetOccasionTemplatesQuery();
    const { data: contactsData } = useGetContactsQuery({ page: 1, limit: 100 });
    const allContacts = contactsData?.items || [];

    const [selectedTemplate, setSelectedTemplate] = useState<OccasionTemplate | null>(null);
    const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
    const detailSheetRef = useRef<BottomSheetRef>(null);
    const contactPickerRef = useRef<BottomSheetRef>(null);

    const [subscribeToTemplate, { isLoading: isSubscribing }] = useSubscribeToTemplateMutation();

    const handleOpenDetail = (template: OccasionTemplate) => {
        setSelectedTemplate(template);
        detailSheetRef.current?.expand();
    };

    const handleOpenContactPicker = () => {
        detailSheetRef.current?.close();
        contactPickerRef.current?.expand();
    };

    const toggleContact = (id: string) => {
        setSelectedContactIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubscribe = async () => {
        if (!selectedTemplate || selectedContactIds.length === 0) return;

        try {
            // The API currently takes one contactId at a time based on types. 
            // I'll loop or wait for a bulk API if available, but for now I'll do individual calls.
            // Wait, I should check if subscribeToTemplate handles multiple. 
            // Type says: SubscribeOccasionDto { templateId: string; contactId: string; }

            for (const contactId of selectedContactIds) {
                await subscribeToTemplate({
                    templateId: selectedTemplate.id,
                    contactId
                }).unwrap();
            }

            toast.success("Success", { description: `${selectedTemplate.title} added for ${selectedContactIds.length} people! 🎉` });
            contactPickerRef.current?.close();
            setSelectedContactIds([]);
            setSelectedTemplate(null);
        } catch (err) {
            console.error(err);
            toast.error("Error", { description: "Failed to subscribe contacts." });
        }
    };

    if (isTemplatesLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h2">Browse Holidays</Typography>
            </View>

            <FlashList
                data={templates}
                numColumns={2}
                contentContainerStyle={{ padding: spacing.xl }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <Animated.View
                        entering={FadeInDown.delay(index * 100).duration(500)}
                        style={{ flex: 1, padding: 6 }}
                    >
                        <Pressable
                            onPress={() => handleOpenDetail(item)}
                            style={({ pressed }) => [
                                styles.templateCard,
                                { backgroundColor: colors.surfaceRaised },
                                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                            ]}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="gift-outline" size={28} color={colors.primary} />
                            </View>
                            <Typography variant="bodyBold" style={{ textAlign: 'center' }} numberOfLines={2}>{item.title}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>
                                {new Date(2024, item.month - 1, item.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </Typography>
                        </Pressable>
                    </Animated.View>
                )}
            />

            {/* Template Detail Sheet */}
            <BottomSheetWrapper ref={detailSheetRef} snapPoints={['40%']} scrollable>
                {selectedTemplate && (
                    <View style={styles.detailContainer}>
                        <View style={styles.detailHeader}>
                            <View style={[styles.iconContainerLarge, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="gift-outline" size={40} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Typography variant="h2">{selectedTemplate.title}</Typography>
                                <Typography variant="body" color={colors.textSecondary}>
                                    {new Date(2024, selectedTemplate.month - 1, selectedTemplate.day).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                                </Typography>
                            </View>
                        </View>

                        <Typography variant="body" color={colors.textSecondary} style={{ marginVertical: spacing.lg }}>
                            {selectedTemplate.description || `Never forget ${selectedTemplate.title}. Add your friends and family to this celebration group.`}
                        </Typography>

                        <Button
                            title="Add People"
                            onPress={handleOpenContactPicker}
                            leftIcon={<Ionicons name="people-outline" size={20} color="#FFF" />}
                        />
                    </View>
                )}
            </BottomSheetWrapper>
            {/* Multi-select Contact Picker Sheet */}
            <BottomSheetWrapper ref={contactPickerRef} snapPoints={['80%']} scrollable>
                <View style={{ flex: 1 }}>
                    <Typography variant="h2" style={{ marginBottom: spacing.md }}>Select Contacts</Typography>
                    <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.lg }}>
                        Who would you like to add to {selectedTemplate?.title}?
                    </Typography>

                    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                        {allContacts.map((contact) => (
                            <Pressable
                                key={contact.id}
                                onPress={() => toggleContact(contact.id)}
                                style={styles.contactItem}
                            >
                                <Avatar uri={contact.avatar} name={contact.name} size="md" />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Typography variant="bodyBold">{contact.name}</Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>{contact.phoneNumber}</Typography>
                                </View>
                                <View style={[
                                    styles.checkbox,
                                    { borderColor: colors.border },
                                    selectedContactIds.includes(contact.id) && { backgroundColor: colors.primary, borderColor: colors.primary }
                                ]}>
                                    {selectedContactIds.includes(contact.id) && (
                                        <Ionicons name="checkmark" size={16} color="#FFF" />
                                    )}
                                </View>
                            </Pressable>
                        ))}
                    </ScrollView>

                    <View style={{ paddingTop: spacing.md }}>
                        <Button
                            title={`Subscribe ${selectedContactIds.length} ${selectedContactIds.length === 1 ? 'Person' : 'People'}`}
                            onPress={handleSubscribe}
                            isLoading={isSubscribing}
                            disabled={selectedContactIds.length === 0}
                        />
                    </View>
                </View>
            </BottomSheetWrapper>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 10,
        gap: 16,
        paddingTop: spacing['4xl'],
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    templateCard: {
        padding: 20,
        borderRadius: 24,
        alignItems: 'center',
        gap: 8,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconContainerLarge: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailContainer: {
        paddingBottom: 20,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
