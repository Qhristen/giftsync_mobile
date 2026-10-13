import CreateEventSheet from '@/components/sheets/CreateEventSheet';
import EventGridSkeleton from '@/components/skeletons/EventGridSkeleton';
import { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetMonthlyEventsQuery, useGetUpcomingEventsQuery } from '@/store/api/event';
import {
    Add01Icon,
    ArrowRight01Icon,
    Calendar01Icon,
    CourseIcon,
    FavouriteIcon,
    GiftIcon,
    SmileIcon,
    SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Contacts from 'expo-contacts/legacy';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, SectionList, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const eventIcon = (title?: string) => {
    const value = title?.toLowerCase() || '';
    if (value.includes('birthday')) return GiftIcon;
    if (value.includes('anniversary') || value.includes('wedding') || value.includes('valentine')) return FavouriteIcon;
    if (value.includes('graduat')) return CourseIcon;
    if (value.includes('baby')) return SmileIcon;
    if (value.includes('holiday') || value.includes('party') || value.includes('christmas')) return SparklesIcon;
    return Calendar01Icon;
};

const dateParts = (date: string) => ({
    day: new Date(date).toLocaleDateString(undefined, { day: '2-digit' }),
    month: new Date(date).toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
    weekday: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase(),
});

export default function PlansScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(currentMonth);
    const selectedYear = selectedMonthIndex < currentMonth ? currentYear + 1 : currentYear;
    const [selectedPhoneContact, setSelectedPhoneContact] = useState<{ name: string; phone: string } | null>(null);
    const createSheetRef = useRef<BottomSheetRef>(null);
    const monthScrollRef = useRef<ScrollView>(null);
    const monthLayouts = useRef<Record<string, { x: number; width: number }>>({});
    const [scrollWidth, setScrollWidth] = useState(0);

    const { data: monthlyEvents, isFetching: monthlyFetching, refetch: refetchMonthly } = useGetMonthlyEventsQuery({ month: selectedMonthIndex + 1, year: selectedYear });
    const { data: upcomingEvents = [], isFetching: upcomingFetching, refetch: refetchUpcoming } = useGetUpcomingEventsQuery();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const visibleMonths = Array.from({ length: 6 }, (_, offset) => {
        const index = (currentMonth + offset) % 12;
        return { index, name: months[index] };
    });
    const selectedMonthName = months[selectedMonthIndex];
    const monthItems = monthlyEvents?.items || [];
    const otherEvents = upcomingEvents
        .filter((event) => {
            const date = new Date(event.date);
            return date.getMonth() !== selectedMonthIndex || date.getFullYear() !== selectedYear;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const featured = monthItems[0] || otherEvents[0];

    const sections = [
        { title: `${selectedMonthName.toUpperCase()} POCKET`, data: monthItems.filter((item) => item.id !== featured?.id) },
        { title: 'FURTHER ALONG THE MAP', data: otherEvents.filter((item) => item.id !== featured?.id) },
    ].filter((section) => section.data.length);

    const centerMonth = React.useCallback((month: string) => {
        const layout = monthLayouts.current[month];
        if (layout && monthScrollRef.current && scrollWidth) {
            monthScrollRef.current.scrollTo({ x: layout.x - scrollWidth / 2 + layout.width / 2, animated: true });
        }
    }, [scrollWidth]);

    useEffect(() => {
        const timer = setTimeout(() => centerMonth(selectedMonthName), 100);
        return () => clearTimeout(timer);
    }, [centerMonth, selectedMonthName]);

    const onRefresh = () => {
        refetchMonthly();
        refetchUpcoming();
    };

    const addPlan = async () => {
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status !== 'granted') return;
            const contact = await Contacts.presentContactPickerAsync();
            if (!contact?.name) return;
            setSelectedPhoneContact({ name: contact.name, phone: contact.phoneNumbers?.[0]?.number || '' });
            createSheetRef.current?.expand();
        } catch (error) {
            console.error('Error picking contact:', error);
        }
    };

    const palette = [colors.lilac, colors.peach, colors.mint, colors.lemon];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={{ paddingHorizontal: spacing.xl }}>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE DATE MAP</Typography>
                    <Typography variant="h1">Plans for your people</Typography>
                    <Typography variant="body" color={colors.textSecondary}>Follow the trail to every moment that matters.</Typography>
                </View>

                <ScrollView
                    ref={monthScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onLayout={(event) => setScrollWidth(event.nativeEvent.layout.width)}
                    contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 9, paddingVertical: 16 }}
                >
                    {visibleMonths.map(({ name, index }) => {
                        const active = index === selectedMonthIndex;
                        return (
                            <Pressable
                                key={name}
                                onLayout={(event) => {
                                    monthLayouts.current[name] = event.nativeEvent.layout;
                                    if (active) centerMonth(name);
                                }}
                                onPress={() => setSelectedMonthIndex(index)}
                                style={[styles.monthTicket, { backgroundColor: active ? colors.ink : colors.surface, borderColor: colors.ink }]}
                            >
                                <Typography variant="caption" color={active ? colors.surface : colors.textSecondary} style={styles.overline}>{name.slice(0, 3).toUpperCase()}</Typography>
                                <Typography variant="h4" color={active ? colors.surface : colors.textPrimary}>{String(index + 1).padStart(2, '0')}</Typography>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {featured ? (
                    <Animated.View entering={FadeInDown.duration(350)} style={{ paddingHorizontal: spacing.xl }}>
                        <Pressable
                            onPress={() => router.push({ pathname: '/event-detail', params: { id: featured.id } })}
                            style={({ pressed }) => [styles.featuredPlan, { backgroundColor: colors.lemon, borderColor: colors.ink, shadowColor: colors.ink }, pressed && styles.pressed]}
                        >
                            <View style={[styles.featuredDate, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                                <Typography variant="caption" style={styles.overline}>{dateParts(featured.date).weekday}</Typography>
                                <Typography variant="h1" style={styles.featuredDay}>{dateParts(featured.date).day}</Typography>
                                <Typography variant="caption" style={styles.overline}>{dateParts(featured.date).month}</Typography>
                            </View>
                            <View style={styles.featuredCopy}>
                                <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>NEXT STOP ON THE MAP</Typography>
                                <Typography variant="h2" numberOfLines={1}>{featured.contact?.name || featured.title}</Typography>
                                <Typography variant="body" color={colors.textSecondary} numberOfLines={1}>{featured.title}</Typography>
                                <View style={[styles.openPlan, { backgroundColor: colors.ink }]}>
                                    <Typography variant="caption" color={colors.surface} style={styles.overline}>OPEN PLAN</Typography>
                                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.surface} />
                                </View>
                            </View>
                            <View style={[styles.featuredIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={eventIcon(featured.title)} size={25} color={colors.primary} />
                            </View>
                        </Pressable>
                    </Animated.View>
                ) : (
                    <Pressable onPress={addPlan} style={[styles.emptyFeature, { marginHorizontal: spacing.xl, backgroundColor: colors.mint, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={Add01Icon} size={28} color={colors.ink} />
                        <View style={{ flex: 1 }}>
                            <Typography variant="h3">Map the first moment.</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Choose someone from your contacts to begin.</Typography>
                        </View>
                    </Pressable>
                )}
            </View>

            {monthlyFetching && upcomingFetching && !featured ? (
                <EventGridSkeleton />
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={monthlyFetching || upcomingFetching} onRefresh={onRefresh} tintColor={colors.primary} />}
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
                    renderSectionHeader={({ section }) => (
                        <View style={[styles.sectionHeader, { backgroundColor: colors.background, paddingHorizontal: spacing.xl }]}>
                            <View style={[styles.sectionLine, { backgroundColor: colors.ink }]} />
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>{section.title}</Typography>
                        </View>
                    )}
                    renderItem={({ item, index, section }) => {
                        const colorIndex = (index + (section.title.startsWith('FURTHER') ? 2 : 0)) % palette.length;
                        const parts = dateParts(item.date);
                        return (
                            <Animated.View entering={FadeInDown.delay(Math.min(index * 55, 250)).duration(300)} style={{ paddingHorizontal: spacing.xl }}>
                                <Pressable
                                    onPress={() => router.push({ pathname: '/event-detail', params: { id: item.id } })}
                                    style={({ pressed }) => [styles.mapRow, { backgroundColor: colors.surface, borderColor: colors.ink, shadowColor: palette[colorIndex] }, pressed && styles.pressed]}
                                >
                                    <View style={[styles.mapDate, { backgroundColor: palette[colorIndex], borderColor: colors.ink }]}>
                                        <Typography variant="h3">{parts.day}</Typography>
                                        <Typography variant="caption" style={styles.overline}>{parts.month}</Typography>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>{parts.weekday} · {item.title.toUpperCase()}</Typography>
                                        <Typography variant="h4" numberOfLines={1}>{item.contact?.name || item.title}</Typography>
                                    </View>
                                    <View style={[styles.rowIcon, { backgroundColor: palette[colorIndex], borderColor: colors.ink }]}>
                                        <HugeiconsIcon icon={eventIcon(item.title)} size={19} color={colors.ink} />
                                    </View>
                                </Pressable>
                            </Animated.View>
                        );
                    }}
                    ListEmptyComponent={featured ? (
                        <View style={[styles.onlyPlan, { marginHorizontal: spacing.xl }]}>
                            <Typography variant="caption" color={colors.textSecondary}>That’s the whole map for this month.</Typography>
                        </View>
                    ) : null}
                />
            )}

            <Pressable
                onPress={addPlan}
                style={({ pressed }) => [styles.fab, { bottom: Math.max(insets.bottom, 10) + 78, right: spacing.xl, backgroundColor: colors.accent, borderColor: colors.ink, shadowColor: colors.ink }, pressed && styles.pressed]}
            >
                <HugeiconsIcon icon={Add01Icon} size={21} color="#17151D" />
                <Typography variant="label" color="#17151D">Add a stop</Typography>
            </Pressable>

            <CreateEventSheet
                ref={createSheetRef}
                fixedContactName={selectedPhoneContact?.name}
                fixedContactPhone={selectedPhoneContact?.phone}
                onSuccess={onRefresh}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingBottom: 8 },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 0.8 },
    monthTicket: { width: 62, height: 63, borderWidth: 1.5, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    featuredPlan: { minHeight: 156, borderWidth: 1.5, borderRadius: 24, padding: 15, flexDirection: 'row', alignItems: 'stretch', gap: 13, shadowOffset: { width: 5, height: 6 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
    featuredDate: { width: 78, borderWidth: 1.5, borderRadius: 18, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-3deg' }] },
    featuredDay: { fontSize: 38, lineHeight: 42 },
    featuredCopy: { flex: 1, justifyContent: 'center', gap: 3 },
    openPlan: { alignSelf: 'flex-start', minHeight: 33, borderRadius: 10, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
    featuredIcon: { position: 'absolute', width: 42, height: 42, borderWidth: 1.25, borderRadius: 13, right: 12, top: -9, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '5deg' }] },
    emptyFeature: { minHeight: 112, borderWidth: 1.5, borderRadius: 22, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 13 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 15, paddingBottom: 10 },
    sectionLine: { width: 28, height: 2 },
    mapRow: { minHeight: 90, borderWidth: 1.5, borderRadius: 20, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 3 },
    mapDate: { width: 58, height: 62, borderWidth: 1.25, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    rowIcon: { width: 38, height: 38, borderWidth: 1.25, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    onlyPlan: { paddingVertical: 16, alignItems: 'center' },
    fab: { position: 'absolute', minWidth: 126, height: 50, borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 5 },
    pressed: { opacity: 0.85, transform: [{ translateY: 2 }] },
});
