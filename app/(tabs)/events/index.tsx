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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from '@/utils/scaling';

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
            monthScrollRef.current.scrollTo({ x: layout.x - scrollWidth / 2 + layout.width / 2, animated: false });
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
            <View style={[styles.header, { paddingTop: insets.top + moderateScale(10) }]}>
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
                    contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: moderateScale(9), paddingVertical: moderateScale(16) }}
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
                    <View style={{ paddingHorizontal: spacing.xl }}>
                        <Pressable
                            onPress={() => router.push({ pathname: '/event-detail', params: { id: featured.id } })}
                            style={({ pressed }) => [styles.featuredPlan, { backgroundColor: colors.lemon, borderColor: colors.ink }, pressed && styles.pressed]}
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
                                    <HugeiconsIcon icon={ArrowRight01Icon} size={moderateScale(16)} color={colors.surface} />
                                </View>
                            </View>
                            <View style={[styles.featuredIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={eventIcon(featured.title)} size={moderateScale(25)} color={colors.primary} />
                            </View>
                        </Pressable>
                    </View>
                ) : (
                    <Pressable onPress={addPlan} style={[styles.emptyFeature, { marginHorizontal: spacing.xl, backgroundColor: colors.mint, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={Add01Icon} size={moderateScale(28)} color={colors.ink} />
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
                    contentContainerStyle={{ paddingTop: moderateScale(12), paddingBottom: moderateScale(120) }}
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
                            <View style={{ paddingHorizontal: spacing.xl }}>
                                <Pressable
                                    onPress={() => router.push({ pathname: '/event-detail', params: { id: item.id } })}
                                    style={({ pressed }) => [styles.mapRow, { backgroundColor: colors.surface, borderColor: colors.ink }, pressed && styles.pressed]}
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
                                        <HugeiconsIcon icon={eventIcon(item.title)} size={moderateScale(19)} color={colors.ink} />
                                    </View>
                                </Pressable>
                            </View>
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
                style={({ pressed }) => [styles.fab, { bottom: Math.max(insets.bottom, moderateScale(10)), right: spacing.xl, backgroundColor: colors.accent, borderColor: colors.ink }, pressed && styles.pressed]}
            >
                <HugeiconsIcon icon={Add01Icon} size={moderateScale(21)} color="#17151D" />
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
    header: { paddingBottom: moderateScale(8) },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(0.8) },
    monthTicket: { width: moderateScale(62), height: moderateScale(63), borderWidth: 1.5, borderRadius: moderateScale(14), alignItems: 'center', justifyContent: 'center' },
    featuredPlan: { minHeight: moderateScale(156), borderWidth: 1.5, borderRadius: moderateScale(24), padding: moderateScale(15), flexDirection: 'row', alignItems: 'stretch', gap: moderateScale(13), },
    featuredDate: { width: moderateScale(78), borderWidth: 1.5, borderRadius: moderateScale(18), alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-3deg' }] },
    featuredDay: { fontSize: moderateScale(38), lineHeight: moderateScale(42) },
    featuredCopy: { flex: 1, justifyContent: 'center', gap: moderateScale(3) },
    openPlan: { alignSelf: 'flex-start', minHeight: moderateScale(33), borderRadius: moderateScale(10), paddingHorizontal: moderateScale(9), flexDirection: 'row', alignItems: 'center', gap: moderateScale(5), marginTop: moderateScale(8) },
    featuredIcon: { position: 'absolute', width: moderateScale(42), height: moderateScale(42), borderWidth: 1.25, borderRadius: moderateScale(13), right: moderateScale(12), top: moderateScale(-9), alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '5deg' }] },
    emptyFeature: {borderWidth: 1.5, borderRadius: moderateScale(22), padding: moderateScale(17), flexDirection: 'row', alignItems: 'center', gap: moderateScale(13) },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(10), paddingTop: moderateScale(15), paddingBottom: moderateScale(10) },
    sectionLine: { width: moderateScale(28), height: moderateScale(2) },
    mapRow: { minHeight: moderateScale(90), borderWidth: 1.5, borderRadius: moderateScale(20), padding: moderateScale(12), flexDirection: 'row', alignItems: 'center', gap: moderateScale(12), marginBottom: moderateScale(14), },
    mapDate: { width: moderateScale(58), height: moderateScale(62), borderWidth: 1.25, borderRadius: moderateScale(14), alignItems: 'center', justifyContent: 'center' },
    rowIcon: { width: moderateScale(38), height: moderateScale(38), borderWidth: 1.25, borderRadius: moderateScale(12), alignItems: 'center', justifyContent: 'center' },
    onlyPlan: { paddingVertical: moderateScale(16), alignItems: 'center' },
    fab: { position: 'absolute', minWidth: moderateScale(126), height: moderateScale(50), borderWidth: 1.5, borderRadius: moderateScale(16), paddingHorizontal: moderateScale(14), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: moderateScale(7), },
    pressed: { opacity: 0.85, transform: [{ translateY: moderateScale(2) }] },
});
