import ContactDetailSheet from '@/components/sheets/ContactDetailSheet';
import CreateContactSheet from '@/components/sheets/CreateContactSheet';
import CreateOccasionSheet from '@/components/sheets/CreateOccasionSheet';
import OccasionGridSkeleton from '@/components/skeletons/OccasionGridSkeleton';
import Avatar from '@/components/ui/Avatar';
import { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { moderateScale } from '@/utils/scaling';
import * as Contacts from "expo-contacts/legacy";
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useGetMonthlyOccasionsQuery, useGetUpcomingOccasionsQuery } from '@/store/api/occasionApi';
import { spacing } from '@/theme';
import { Contact, Occasion } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function OccasionsScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const { openAdd, view } = useLocalSearchParams<{ openAdd?: string; view?: string }>();

    // API Hooks
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-indexed
    const selectedYear = selectedMonthIndex < currentMonth ? currentYear + 1 : currentYear;

    // Fetch the selected month's occasions
    const { data: monthlyOccasions, isFetching: isMonthlyFetching, refetch: refetchMonthly } = useGetMonthlyOccasionsQuery({
        month: selectedMonthIndex + 1,
        year: selectedYear
    });

    // Use the upcoming occasions query for "Other Occasions" instead of individual monthly fetches
    // This is much more efficient than firing 11 extra requests.
    const { data: upcomingOccasions = [], isFetching: isUpcomingFetching, refetch: refetchUpcoming } = useGetUpcomingOccasionsQuery();

    const otherOccasions = upcomingOccasions
        .filter(o => {
            const date = new Date(o.date);
            // Exclude occasions in the currently selected month to avoid duplication
            return date.getMonth() !== selectedMonthIndex || date.getFullYear() !== selectedYear;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const isRefreshing = isMonthlyFetching || isUpcomingFetching;

    const [viewMode, setViewMode] = useState<'calendar' | 'contacts'>('calendar');
    const [page, setPage] = useState(1);


    const onRefresh = React.useCallback(() => {
        setPage(1);
        refetchMonthly();
        refetchUpcoming();
    }, [refetchMonthly, refetchUpcoming]);

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const visibleMonths = Array.from({ length: 6 }).map((_, i) => {
        const index = (currentMonth + i) % 12;
        return { name: months[index], index };
    });
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
                        createSheetRef.current?.expand();
                    }
                }
            } catch (err) {
                console.error('Error picking contact:', err);
            }
        }
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
                                { backgroundColor: selectedMonthIndex === index ? colors.primary : colors.surface },
                                pressed && { opacity: 0.8 },
                            ]}
                        >
                            <Typography variant="label" color={selectedMonthIndex === index ? '#FFFFFF' : colors.textPrimary}>{name}</Typography>
                        </Pressable>
                    ))}
                </ScrollView>


            </View>

            {(isMonthlyFetching || isUpcomingFetching) && sections.length === 0 ? (
                <View style={{ flex: 1, paddingTop: 20 }}>
                    <OccasionGridSkeleton />
                </View>
            ) : (
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
                                    onPress={() => router.push({ pathname: '/occasion-detail', params: { id: item.id } })}
                                    style={({ pressed }) => [
                                        styles.gridCard,
                                        { backgroundColor: colors.surface },
                                        pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
                                    ]}
                                >
                                    <Avatar uri={item.contact?.avatar} name={item.contact?.name} size="md" />
                                    <View style={styles.gridCardContent}>
                                        <Typography variant="bodyBold" numberOfLines={1} style={{ textAlign: 'center', fontSize: moderateScale(13) }}>
                                            {item.contact?.name?.split(' ')[0]}
                                        </Typography>
                                        <Typography variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ textAlign: 'center', fontSize: moderateScale(10) }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="caption" color={colors.primary} style={{ textAlign: 'center', fontSize: moderateScale(10), marginTop: 2 }}>
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
            )}


            {/* Add Contact FAB */}
            <Pressable
                onPress={handleOpenCreateSheet}
                style={({ pressed }) => [
                    styles.fab,
                    { 
                        backgroundColor: colors.primary, 
                        bottom: insets.bottom + spacing.md, 
                        right: spacing.xl 
                    },
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
                    router.push({ pathname: '/occasion-detail', params: { id } });
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
