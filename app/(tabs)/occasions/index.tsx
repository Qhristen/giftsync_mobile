import ContactDetailSheet from '@/components/sheets/ContactDetailSheet';
import CreateContactSheet from '@/components/sheets/CreateContactSheet';
import CreateOccasionSheet from '@/components/sheets/CreateOccasionSheet';
import Avatar from '@/components/ui/Avatar';
import { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { FlashList } from '@shopify/flash-list';
import * as Contacts from 'expo-contacts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, SectionList, StyleSheet, View } from 'react-native';

import { useGetContactsQuery } from '@/store/api/contactsApi';
import { useGetMonthlyOccasionsQuery } from '@/store/api/occasionApi';
import { spacing } from '@/theme';
import { Contact, Occasion } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function OccasionsScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const { openAdd, view } = useLocalSearchParams<{ openAdd?: string; view?: string }>();

    // API Hooks
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-indexed

    // Fetch the selected month's occasions
    const { data: monthlyOccasions, isFetching: isMonthlyFetching, refetch: refetchMonthly } = useGetMonthlyOccasionsQuery({
        month: selectedMonthIndex + 1,
        year: currentYear
    });

    // Pre-fetch ALL remaining months of the year (fixed 12 slots, skipped when out of range)
    // This keeps hooks calls stable regardless of which month is selected.
    const month0 = useGetMonthlyOccasionsQuery({ month: 1, year: currentYear }, { skip: currentMonth > 0 });
    const month1 = useGetMonthlyOccasionsQuery({ month: 2, year: currentYear }, { skip: currentMonth > 1 });
    const month2 = useGetMonthlyOccasionsQuery({ month: 3, year: currentYear }, { skip: currentMonth > 2 });
    const month3 = useGetMonthlyOccasionsQuery({ month: 4, year: currentYear }, { skip: currentMonth > 3 });
    const month4 = useGetMonthlyOccasionsQuery({ month: 5, year: currentYear }, { skip: currentMonth > 4 });
    const month5 = useGetMonthlyOccasionsQuery({ month: 6, year: currentYear }, { skip: currentMonth > 5 });
    const month6 = useGetMonthlyOccasionsQuery({ month: 7, year: currentYear }, { skip: currentMonth > 6 });
    const month7 = useGetMonthlyOccasionsQuery({ month: 8, year: currentYear }, { skip: currentMonth > 7 });
    const month8 = useGetMonthlyOccasionsQuery({ month: 9, year: currentYear }, { skip: currentMonth > 8 });
    const month9 = useGetMonthlyOccasionsQuery({ month: 10, year: currentYear }, { skip: currentMonth > 9 });
    const month10 = useGetMonthlyOccasionsQuery({ month: 11, year: currentYear }, { skip: currentMonth > 10 });
    const month11 = useGetMonthlyOccasionsQuery({ month: 12, year: currentYear }, { skip: false });

    // All per-month results indexed 0–11
    const allMonthResults = [month0, month1, month2, month3, month4, month5, month6, month7, month8, month9, month10, month11];

    // Occasions from every visible month EXCEPT the selected one
    const otherOccasions = allMonthResults
        .flatMap((result, i) => {
            if (i === selectedMonthIndex) return []; // exclude selected month
            if (i < currentMonth) return [];          // exclude past months
            return result.data?.items ?? [];
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const isOtherFetching = allMonthResults.some((r, i) => i !== selectedMonthIndex && i >= currentMonth && r.isFetching);
    const refetchOtherMonths = () => allMonthResults.forEach((r, i) => { if (i >= currentMonth) r.refetch(); });


    const [viewMode, setViewMode] = useState<'calendar' | 'contacts'>('calendar');
    const [page, setPage] = useState(1);
    const { data: contactsData, isFetching: isContactsFetching, refetch: refetchContacts } = useGetContactsQuery({ page, limit: 20 });

    // We get all accumulated items directly from RTKQ since we used merge/serializeQueryArgs
    const allContacts = contactsData?.items || [];

    const isRefreshing = isMonthlyFetching || isOtherFetching || isContactsFetching;

    const onRefresh = React.useCallback(() => {
        setPage(1);
        refetchMonthly();
        refetchOtherMonths();
        refetchContacts();
    }, [refetchMonthly, refetchContacts]);

    const loadMore = () => {
        if (contactsData?.meta && page < contactsData.meta.totalPages && !isContactsFetching) {
            setPage(p => p + 1);
        }
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const visibleMonths = months.map((m, i) => ({ name: m, index: i })).slice(currentMonth);
    const selectedMonthName = months[selectedMonthIndex];

    const createSheetRef = useRef<BottomSheetRef>(null);
    const contactSheetRef = useRef<BottomSheetRef>(null);
    const contactDetailSheetRef = useRef<BottomSheetRef>(null);
    const scrollRef = useRef<ScrollView>(null);
    const [scrollWidth, setScrollWidth] = useState(0);
    const monthLayouts = useRef<Record<string, { x: number; width: number }>>({});
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [selectedPhoneContact, setSelectedPhoneContact] = useState<{ name: string; phone: string } | null>(null);

    const centerMonth = (month: string) => {
        const layout = monthLayouts.current[month];
        if (layout && scrollRef.current && scrollWidth) {
            const centerX = layout.x - (scrollWidth / 2) + (layout.width / 2);
            scrollRef.current.scrollTo({ x: centerX, animated: true });
        }
    };

    // useEffect(() => {
    //     if (view === 'contacts') setViewMode('contacts');
    //     if (openAdd === 'true') {
    //         createSheetRef.current?.expand();
    //     }
    // }, [view, openAdd]);

    useEffect(() => {
        const timer = setTimeout(() => {
            centerMonth(selectedMonthName);
        }, 100);
        return () => clearTimeout(timer);
    }, [selectedMonthIndex, scrollWidth]);

    const handleOpenCreateSheet = async () => {
        if (viewMode === 'contacts') {
            contactSheetRef.current?.expand();
        } else {
            // Open native device contact picker
            try {
                const { status } = await Contacts.requestPermissionsAsync();
                if (status === 'granted') {
                    const contact = await Contacts.presentContactPickerAsync();
                    if (contact && contact.name) {
                        const contactName = contact.name || 'Unknown';
                        const contactPhone = contact.phoneNumbers?.[0]?.number || '';

                        setSelectedPhoneContact({ name: contactName, phone: contactPhone });

                        // Check if this contact exists in the app
                        const existing = allContacts.find(
                            c => c.name.toLowerCase() === contactName.toLowerCase() ||
                                (contactPhone && c.phoneNumber === contactPhone)
                        );

                        if (existing) {
                            setSelectedContact(existing);
                        } else {
                            setSelectedContact(null);
                        }

                        createSheetRef.current?.expand();
                    }
                }
            } catch (err) {
                console.error('Error picking contact:', err);
            }
        }
    };

    const handleContactClick = (contact: Contact) => {
        setSelectedContact(contact);
        contactDetailSheetRef.current?.expand();
    };

    const chunkArray = <T,>(arr: T[], size: number): T[][] => {
        return arr.reduce((acc, _, i) => {
            if (i % size === 0) acc.push(arr.slice(i, i + size));
            return acc;
        }, [] as T[][]);
    };

    const sections = [
        { title: `Upcoming in ${selectedMonthName}`, data: chunkArray(monthlyOccasions?.items ?? [], 3) },
        { title: 'Other Occasions', data: chunkArray(otherOccasions, 3) },
    ].filter(section => section.data.length > 0);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: spacing.xl }}>
                    <Typography variant="h1" style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl }}>Occasions</Typography>
                </View>

                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onLayout={(e) => setScrollWidth(e.nativeEvent.layout.width)}
                    contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 12, paddingVertical: spacing.md }}
                >
                    {visibleMonths.map(({ name, index }) => (
                        <Pressable
                            key={name}
                            onLayout={(e) => {
                                const { x, width } = e.nativeEvent.layout;
                                monthLayouts.current[name] = { x, width };
                                if (index === selectedMonthIndex) centerMonth(name);
                            }}
                            onPress={() => setSelectedMonthIndex(index)}
                            style={({ pressed }) => [
                                styles.monthBtn,
                                { backgroundColor: selectedMonthIndex === index ? colors.primary : colors.surfaceRaised },
                                pressed && { opacity: 0.8 },
                            ]}
                        >
                            <Typography variant="label" color={selectedMonthIndex === index ? '#FFFFFF' : colors.textPrimary}>{name}</Typography>
                        </Pressable>
                    ))}
                </ScrollView>

            </View>
            <SectionList
                sections={sections}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => item[0]?.id || `row-${index}`}
                renderItem={({ item: row, index: rowIndex }) => (
                    <View style={styles.gridRow}>
                        {row.map((item: Occasion, itemIndex: number) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeInDown.delay((rowIndex * 3 + itemIndex) * 60).duration(300).springify().damping(50)}
                                style={{ flex: 1 }}
                            >
                                <Pressable
                                    onPress={() => router.push({ pathname: '/(tabs)/occasions/[id]', params: { id: item.id } })}
                                    style={({ pressed }) => [
                                        styles.gridCard,
                                        { backgroundColor: colors.surfaceRaised },
                                        pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
                                    ]}
                                >
                                    <Avatar uri={item.contact?.avatar} name={item.contact?.name} size="md" />
                                    <View style={styles.gridCardContent}>
                                        <Typography variant="bodyBold" numberOfLines={1} style={{ textAlign: 'center', fontSize: 13 }}>
                                            {item.contact?.name?.split(' ')[0]}
                                        </Typography>
                                        <Typography variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ textAlign: 'center', fontSize: 10 }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="caption" color={colors.primary} style={{ textAlign: 'center', fontSize: 10, marginTop: 2 }}>
                                            {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </Typography>
                                    </View>
                                </Pressable>
                            </Animated.View>
                        ))}
                        {/* Fillers to maintain grid layout */}
                        {row.length < 3 && Array(3 - row.length).fill(0).map((_, i) => (
                            <View key={`filler-${i}`} style={[styles.gridCard, { backgroundColor: 'transparent' }]} />
                        ))}
                    </View>
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={[styles.sectionHeader, { backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingVertical: spacing.xs }]}>
                        <Typography variant="label" color={colors.textSecondary} style={{ paddingVertical: 8 }}>
                            {title}
                        </Typography>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 100 }}
            />


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
                fixedContactName={selectedPhoneContact?.name || selectedContact?.name}
                fixedContactPhone={selectedPhoneContact?.phone || selectedContact?.phoneNumber}
            />

            <CreateContactSheet
                ref={contactSheetRef}
                onSuccess={() => {
                    refetchMonthly();
                    refetchOtherMonths();
                    refetchContacts();
                }}
            />

            <ContactDetailSheet
                ref={contactDetailSheetRef}
                contact={selectedContact}
                onClose={() => setSelectedContact(null)}
                onAddOccasion={(c) => {
                    setSelectedContact(c);
                    contactDetailSheetRef.current?.close();
                    setTimeout(() => {
                        createSheetRef.current?.expand();
                    }, 350);
                }}
                onEditOccasion={(id) => {
                    contactDetailSheetRef.current?.close();
                    router.push({ pathname: '/(tabs)/occasions/[id]', params: { id } });
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },
    header: {
        // paddingBottom: 0,
    },
    monthBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 100,
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
    itemContent: {
        flex: 1,
    },
    gridRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        gap: 12,
        marginBottom: 12,
    },
    gridCard: {
        flex: 1,
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        gap: 8,
    },
    gridCardContent: {
        width: '100%',
        alignItems: 'center',
    },
    sectionHeader: {
        // borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
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
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        gap: 12,
        borderRadius: 12,
    },
});
