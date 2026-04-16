import ContactDetailSheet from '@/components/sheets/ContactDetailSheet';
import CreateContactSheet from '@/components/sheets/CreateContactSheet';
import CreateOccasionSheet from '@/components/sheets/CreateOccasionSheet';
import Avatar from '@/components/ui/Avatar';
import { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, SectionList, StyleSheet, View } from 'react-native';

import { useGetContactsQuery } from '@/store/api/contactsApi';
import { useGetMonthlyOccasionsQuery, useGetUpcomingOccasionsQuery } from '@/store/api/occasionApi';
import { spacing } from '@/theme';
import { Contact } from '@/types';
import { Ionicons } from '@expo/vector-icons';

export default function OccasionsScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    // API Hooks
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());
    const currentYear = new Date().getFullYear();

    const { data: upcomingOccasions, isFetching: isUpcomingFetching, refetch: refetchUpcoming } = useGetUpcomingOccasionsQuery();
    const { data: monthlyOccasions, isFetching: isMonthlyFetching, refetch: refetchMonthly } = useGetMonthlyOccasionsQuery({
        month: selectedMonthIndex + 1,
        year: currentYear
    });


    const [viewMode, setViewMode] = useState<'calendar' | 'contacts'>('calendar');
    const { data, isFetching: isContactsFetching, refetch: refetchContacts } = useGetContactsQuery();
    const contacts = data?.items ?? [];
    const isRefreshing = isUpcomingFetching || isMonthlyFetching || isContactsFetching;

    const onRefresh = React.useCallback(() => {
        refetchUpcoming();
        refetchMonthly();
        refetchContacts();
    }, [refetchUpcoming, refetchMonthly, refetchContacts]);

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const selectedMonthName = months[selectedMonthIndex];

    const createSheetRef = useRef<BottomSheetRef>(null);
    const contactSheetRef = useRef<BottomSheetRef>(null);
    const contactDetailSheetRef = useRef<BottomSheetRef>(null);
    const scrollRef = useRef<ScrollView>(null);
    const [scrollWidth, setScrollWidth] = useState(0);
    const monthLayouts = useRef<Record<string, { x: number; width: number }>>({});
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

    const centerMonth = (month: string) => {
        const layout = monthLayouts.current[month];
        if (layout && scrollRef.current && scrollWidth) {
            const centerX = layout.x - (scrollWidth / 2) + (layout.width / 2);
            scrollRef.current.scrollTo({ x: centerX, animated: true });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            centerMonth(selectedMonthName);
        }, 100);
        return () => clearTimeout(timer);
    }, [selectedMonthIndex, scrollWidth]);

    const handleOpenCreateSheet = () => {
        if (viewMode === 'calendar') {
            contactSheetRef.current?.expand();
        } else {
            contactSheetRef.current?.expand();
        }
    };

    const handleContactClick = (contact: Contact) => {
        setSelectedContact(contact);
        contactDetailSheetRef.current?.expand();
    };

    const sections = [
        { title: `Upcoming in ${selectedMonthName}`, data: monthlyOccasions?.items ?? [] },
        { title: 'Other Occasions', data: upcomingOccasions?.filter((o: any) => new Date(o.date).getMonth() !== selectedMonthIndex) ?? [] },
    ].filter(section => section.data.length > 0);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: spacing.xl }}>
                    <Typography variant="h1" style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl }}>{viewMode === 'calendar' ? "Occasions" : "Contacts"}</Typography>
                    <View style={[styles.tabSwitcher, { backgroundColor: colors.surfaceRaised }]}>
                        <Pressable
                            onPress={() => setViewMode('calendar')}
                            style={[styles.tabBtn, viewMode === 'calendar' && { backgroundColor: colors.surface }]}
                        >
                            <Ionicons name="calendar-outline" size={18} color={viewMode === 'calendar' ? colors.primary : colors.textSecondary} />
                        </Pressable>
                        <Pressable
                            onPress={() => setViewMode('contacts')}
                            style={[styles.tabBtn, viewMode === 'contacts' && { backgroundColor: colors.surface }]}
                        >
                            <Ionicons name="people-outline" size={18} color={viewMode === 'contacts' ? colors.primary : colors.textSecondary} />
                        </Pressable>
                    </View>
                </View>

                {viewMode === 'calendar' ? (
                    <ScrollView
                        ref={scrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        onLayout={(e) => setScrollWidth(e.nativeEvent.layout.width)}
                        contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 12, paddingVertical: spacing.md }}
                    >
                        {months.map((m, idx) => (
                            <Pressable
                                key={m}
                                onLayout={(e) => {
                                    const { x, width } = e.nativeEvent.layout;
                                    monthLayouts.current[m] = { x, width };
                                    if (idx === selectedMonthIndex) centerMonth(m);
                                }}
                                onPress={() => setSelectedMonthIndex(idx)}
                                style={({ pressed }) => [
                                    styles.monthBtn,
                                    { backgroundColor: selectedMonthIndex === idx ? colors.primary : colors.surfaceRaised },
                                    pressed && { opacity: 0.8 },
                                ]}
                            >
                                <Typography variant="label" color={selectedMonthIndex === idx ? '#FFFFFF' : colors.textPrimary}>{m}</Typography>
                            </Pressable>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.sm }}>
                        <Typography variant="caption" color={colors.textSecondary}>All your managed friends and family</Typography>
                    </View>
                )}
            </View>

            {viewMode === 'calendar' ? (
                <SectionList
                    sections={sections}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => router.push({ pathname: '/(tabs)/occasions/[id]', params: { id: item.id } })}
                            style={({ pressed }) => [
                                styles.item,
                                { backgroundColor: pressed ? colors.surfaceRaised : 'transparent', paddingHorizontal: spacing.xl },
                            ]}
                        >
                            <View style={[styles.dot, { backgroundColor: item.dotColor === 'red' ? colors.primary : item.dotColor === 'blue' ? colors.secondary : (item.dotColor && item.dotColor.includes('#') ? item.dotColor : colors.success) }]} />
                            <Avatar uri={item.contact?.avatar} name={item.contact?.name} size="sm" />
                            <View style={styles.itemContent}>
                                <Typography variant="bodyBold">{item.contact?.name}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {item.type} • {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Typography>
                            </View>
                        </Pressable>
                    )}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={[styles.sectionHeader, { backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingVertical: spacing.xs }]}>
                            <Typography variant="label" color={colors.textSecondary} style={{ paddingVertical: 8 }}>
                                {title}
                            </Typography>
                        </View>
                    )}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: spacing.md }}
                />
            ) : (
                <FlashList
                    // estimatedItemSize={70}
                    data={contacts}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => handleContactClick(item as any)}
                            style={({ pressed }) => [
                                styles.item,
                                { backgroundColor: pressed ? colors.surfaceRaised : 'transparent', paddingHorizontal: spacing.xl }
                            ]}
                        >
                            <Avatar uri={item.avatar} name={item.name} size="md" />
                            <View style={styles.itemContent}>
                                <Typography variant="bodyBold">{item.name}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {item.relationship} • {item.budget} Budget
                                </Typography>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                        </Pressable>
                    )}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: spacing.md }}
                />
            )}

            {/* Add Contact FAB */}
            <Pressable
                onPress={handleOpenCreateSheet}
                style={({ pressed }) => [
                    styles.fab,
                    { backgroundColor: colors.primary, bottom: spacing.xl + 80, right: spacing.xl },
                    pressed && { opacity: 0.9, transform: [{ scale: 0.95 }] }
                ]}
            >
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </Pressable>

            <CreateOccasionSheet
                ref={createSheetRef}
                fixedContactId={selectedContact?.id}
                fixedContactName={selectedContact?.name}
            />

            <CreateContactSheet
                ref={contactSheetRef}
                onSuccess={(contactId, newContact) => {
                    contactSheetRef.current?.close();
                    if (newContact) {
                        setSelectedContact(newContact);
                    } else {
                        // Fallback if contact object wasn't passed, though it should be.
                        const found = contacts.find(c => c.id === contactId);
                        if (found) setSelectedContact(found as any);
                    }
                    setTimeout(() => {
                        createSheetRef.current?.expand();
                    }, 400); // Wait for the contact sheet to close first
                }}
            />

            {selectedContact && (
                <ContactDetailSheet
                    ref={contactDetailSheetRef}
                    contact={selectedContact}
                    onAddOccasion={(c) => {
                        contactDetailSheetRef.current?.close();
                        createSheetRef.current?.expand();
                    }}
                    onEditOccasion={(id) => {
                        contactDetailSheetRef.current?.close();
                        router.push({ pathname: '/(tabs)/occasions/[id]', params: { id } });
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },
    header: {
        paddingBottom: 0,
    },
    monthBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    tabSwitcher: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 12,
        marginTop: spacing.xl,
    },
    tabBtn: {
        width: 36,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    itemContent: {
        flex: 1,
    },
    sectionHeader: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    planBtn: {
        paddingHorizontal: 12,
        borderRadius: 100,
    },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
