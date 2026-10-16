import UpcomingHolidays from '@/components/event/UpcomingHolidays';
import HomeScreenSkeleton from '@/components/skeletons/HomeScreenSkeleton';
import Avatar from '@/components/ui/Avatar';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { useGetEventTemplatesQuery, useGetUpcomingEventsQuery } from '@/store/api/event';
import { useGetUnreadCountQuery } from '@/store/api/notificationApi';
import { useGetRecommendationsV2Query } from '@/store/api/productApi';
import { useGetProfileQuery } from '@/store/api/userApi';
import { Event } from '@/types';
import { getCountdown } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    Add01Icon,
    ArrowRight01Icon,
    GiftIcon,
    Notification01Icon,
    PackageIcon,
    SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type UpcomingEvent = Event & { contacts?: Event['contact'][] };

const recipientName = (event?: UpcomingEvent) =>
    event?.contact?.name || event?.contacts?.[0]?.name || 'Someone special';

const shortDate = (date: string) =>
    new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

const dateParts = (date: string) => ({
    day: new Date(date).toLocaleDateString(undefined, { day: '2-digit' }),
    month: new Date(date).toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
});

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { enabled: giftRequestsEnabled } = useFeatureFlag('gift_requests');
    const { enabled: recommendationsEnabled } = useFeatureFlag('gift_recommendations');
    const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useGetProfileQuery();
    const { data: upcoming = [], isLoading: eventsLoading, refetch: refetchUpcoming } = useGetUpcomingEventsQuery();
    const { data: eventTemplates = [], isFetching: templatesFetching, refetch: refetchTemplates } = useGetEventTemplatesQuery();
    const { data: unreadCount, refetch: refetchUnread } = useGetUnreadCountQuery();
    const firstUpcoming = upcoming[0];
    const { data: recs = [], isLoading: recsLoading, refetch: refetchRecs } = useGetRecommendationsV2Query(
        { eventId: firstUpcoming?.id as string, limit: 8 },
        { skip: !firstUpcoming || !recommendationsEnabled },
    );

    const onRefresh = React.useCallback(() => {
        refetchProfile();
        refetchUpcoming();
        refetchTemplates();
        refetchUnread();
        if (firstUpcoming && recommendationsEnabled) refetchRecs();
    }, [firstUpcoming, recommendationsEnabled, refetchProfile, refetchUpcoming, refetchTemplates, refetchUnread, refetchRecs]);

    if (profileLoading || eventsLoading) return <HomeScreenSkeleton />;

    const firstName = profile?.name?.split(' ')[0] || 'friend';
    const paperColors = [colors.lilac, colors.peach, colors.mint, colors.lemon];
    const nextDate = firstUpcoming ? dateParts(firstUpcoming.date) : null;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View pointerEvents="none" style={[styles.decorativeOrb, styles.orbOne, { backgroundColor: colors.lilac }]} />
            <View pointerEvents="none" style={[styles.decorativeOrb, styles.orbTwo, { backgroundColor: colors.accent }]} />

            <View style={[styles.headerShell, { paddingTop: insets.top + 12, paddingHorizontal: spacing.xl, paddingBottom: 15 }]}>
                <View style={styles.header}>
                    <View>
                        <View style={styles.eyebrowRow}>
                            <View style={[styles.miniMark, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={GiftIcon} size={14} color="#17151D" />
                            </View>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>GIFTSYNC · {firstName.toUpperCase()}</Typography>
                        </View>
                        <Typography variant="h1" style={styles.pageTitle}>Your gift desk</Typography>
                    </View>
                    <Pressable
                        accessibilityLabel="Notifications"
                        onPress={() => router.push('/notifications')}
                        style={[styles.notificationButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}
                    >
                        <HugeiconsIcon icon={Notification01Icon} size={22} color={colors.ink} />
                        {!!unreadCount?.count && <View style={[styles.notificationDot, { backgroundColor: colors.accent, borderColor: colors.ink }]} />}
                    </Pressable>
                </View>
            </View>

            <View style={styles.scrollFrame}>
                <ScrollView
                    style={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    refreshControl={<RefreshControl refreshing={profileLoading || eventsLoading || templatesFetching} onRefresh={onRefresh} tintColor={colors.primary} />}
                >

                {firstUpcoming && nextDate ? (
                    <View style={{ paddingHorizontal: spacing.xl, marginTop: 22 }}>
                        <Pressable
                            onPress={() => router.push({ pathname: '/event-detail', params: { id: firstUpcoming.id } })}
                            style={({ pressed }) => [styles.momentCard, { backgroundColor: colors.surface, borderColor: colors.ink }, pressed && styles.pressed]}
                        >
                            <View style={[styles.momentColorBlock, { backgroundColor: colors.lemon, borderRightColor: colors.ink }]} />
                            <View style={[styles.dateStamp, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                                <Typography variant="h2" color="#17151D" style={styles.stampDay}>{nextDate.day}</Typography>
                                <Typography variant="caption" color="#17151D" style={styles.overline}>{nextDate.month}</Typography>
                            </View>
                            <View style={styles.momentContent}>
                                <View style={styles.momentKicker}>
                                    <View style={[styles.liveDot, { backgroundColor: colors.primary }]} />
                                    <Typography variant="caption" style={styles.overline}>NEXT ON THE LOVE LIST</Typography>
                                </View>
                                <Typography variant="h1" style={styles.recipientTitle}>{recipientName(firstUpcoming)}</Typography>
                                <Typography variant="h3" color={colors.textSecondary} style={styles.occasionTitle}>{firstUpcoming.title}</Typography>
                                <View style={styles.momentBottom}>
                                    <View style={styles.avatarLabel}>
                                        <Avatar uri={firstUpcoming.contact?.avatar} name={recipientName(firstUpcoming)} size={46} style={{ borderWidth: 1.5, borderColor: colors.ink }} />
                                        <View>
                                            <Typography variant="caption" color={colors.textSecondary}>COUNTDOWN</Typography>
                                            <Typography variant="bodyBold">{getCountdown(firstUpcoming.date)}</Typography>
                                        </View>
                                    </View>
                                    <View style={[styles.openMoment, { backgroundColor: colors.ink }]}>
                                        <Typography variant="caption" color={colors.surface} style={{ fontFamily: 'DMSans_700Bold' }}>Open plan</Typography>
                                        <HugeiconsIcon icon={ArrowRight01Icon} size={17} color={colors.surface} />
                                    </View>
                                </View>
                            </View>
                        </Pressable>
                    </View>
                ) : (
                    <View style={{ paddingHorizontal: spacing.xl, marginTop: 22 }}>
                        <Pressable
                            onPress={() => router.push('/(tabs)/events')}
                            style={[styles.emptyMoment, { backgroundColor: colors.lemon, borderColor: colors.ink }]}
                        >
                            <View style={[styles.emptyMomentIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={Add01Icon} size={26} color={colors.ink} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Typography variant="h2">Start the love list.</Typography>
                                <Typography variant="body" color={colors.textSecondary}>Add a date worth remembering.</Typography>
                            </View>
                            <HugeiconsIcon icon={ArrowRight01Icon} size={23} color={colors.ink} />
                        </Pressable>
                    </View>
                )}

                <View style={{ paddingHorizontal: spacing.xl, marginTop: 28 }}>
                    <View style={styles.sectionLabelRow}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE GIFT DESK</Typography>
                        <View style={[styles.squiggle, { backgroundColor: colors.ink }]} />
                    </View>
                    <View style={styles.bentoRow}>
                        {giftRequestsEnabled && (
                            <Pressable
                                onPress={() => router.push({ pathname: '/gift-request', params: { recipient: recipientName(firstUpcoming), occasion: firstUpcoming?.title, eventId: firstUpcoming?.id } })}
                                style={({ pressed }) => [styles.conciergeTile, { backgroundColor: colors.mint, borderColor: colors.ink }, pressed && styles.pressed]}
                            >
                                <View style={[styles.tileIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                    <HugeiconsIcon icon={SparklesIcon} size={24} color={colors.primary} />
                                </View>
                                <View style={{ marginTop: 'auto', gap: 4 }}>
                                    <Typography variant="h3">Find the impossible</Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>Brief your gift concierge</Typography>
                                </View>
                                <View style={[styles.tileArrow, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#17151D" />
                                </View>
                            </Pressable>
                        )}
                        <View style={[styles.bentoStack, !giftRequestsEnabled && { flex: 1 }]}>
                            <Pressable
                                onPress={() => router.push('/(tabs)/events')}
                                style={({ pressed }) => [styles.smallTile, { backgroundColor: colors.peach, borderColor: colors.ink }, pressed && styles.pressed]}
                            >
                                <View style={styles.smallTileText}>
                                    <Typography variant="bodyBold">Add a date</Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>Never miss one</Typography>
                                </View>
                                <HugeiconsIcon icon={Add01Icon} size={23} color={colors.ink} />
                            </Pressable>
                            <Pressable
                                onPress={() => router.push('/orders')}
                                style={({ pressed }) => [styles.smallTile, { backgroundColor: colors.lilac, borderColor: colors.ink }, pressed && styles.pressed]}
                            >
                                <View style={styles.smallTileText}>
                                    <Typography variant="bodyBold">Gift trail</Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>Track orders</Typography>
                                </View>
                                <HugeiconsIcon icon={PackageIcon} size={23} color={colors.ink} />
                            </Pressable>
                        </View>
                </View>
                    </View>

                {upcoming.length > 0 && (
                    <View style={{ marginTop: 34 }}>
                        <View style={[styles.sectionHeading, { paddingHorizontal: spacing.xl }]}>
                            <View>
                                <Typography variant="h2">The love line</Typography>
                                <Typography variant="body" color={colors.textSecondary}>Little moments coming your way</Typography>
                            </View>
                            <Pressable onPress={() => router.push('/(tabs)/events')} style={[styles.seeAllPill, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <Typography variant="caption" style={styles.overline}>ALL</Typography>
                                <HugeiconsIcon icon={ArrowRight01Icon} size={15} color={colors.ink} />
                            </Pressable>
                        </View>
                        <View style={[styles.timeline, { paddingHorizontal: spacing.xl }]}>
                            <View style={[styles.timelineLine, { backgroundColor: colors.ink }]} />
                            {upcoming.slice(0, 5).map((item, index) => (
                                <View key={item.id} style={styles.timelineRow}>
                                    <View style={styles.railColumn}>
                                        <View style={[styles.timelineDot, { backgroundColor: paperColors[index % paperColors.length], borderColor: colors.ink }]}>
                                            <Typography variant="caption" style={styles.dotNumber}>{index + 1}</Typography>
                                        </View>
                                    </View>
                                    <Pressable
                                        onPress={() => router.push({ pathname: '/event-detail', params: { id: item.id } })}
                                        style={({ pressed }) => [
                                            styles.timelineCard,
                                            {
                                                backgroundColor: colors.surface,
                                                borderColor: colors.ink,
                                                marginLeft: index % 2 ? 14 : 0,
                                                marginRight: index % 2 ? 0 : 14,
                                                transform: [{ rotate: index % 2 ? '1deg' : '-1deg' }],
                                            },
                                            pressed && styles.pressed,
                                        ]}
                                    >
                                        <View style={[styles.timelineDate, { backgroundColor: paperColors[index % paperColors.length], borderColor: colors.ink }]}>
                                            <Typography variant="caption" style={styles.overline}>{shortDate(item.date).toUpperCase()}</Typography>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Typography variant="h4" numberOfLines={1}>{recipientName(item)}</Typography>
                                            <Typography variant="caption" color={colors.textSecondary} numberOfLines={1}>{item.title}</Typography>
                                        </View>
                                        <HugeiconsIcon icon={ArrowRight01Icon} size={18} color={colors.ink} />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <UpcomingHolidays templates={eventTemplates} />

                {recommendationsEnabled && <View style={{ marginTop: 38 }}>
                    <View style={[styles.sectionHeading, { paddingHorizontal: spacing.xl }]}>
                        <View style={{ flex: 1 }}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE POLAROID TRAY</Typography>
                            <Typography variant="h2">Picks for {recipientName(firstUpcoming)}</Typography>
                        </View>
                        <Pressable onPress={() => router.push('/(tabs)/shop')}>
                            <Typography variant="label" color={colors.primary}>Shop all</Typography>
                        </Pressable>
                    </View>
                    {recsLoading ? (
                        <ActivityIndicator color={colors.primary} style={{ margin: spacing.xl }} />
                    ) : recs.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.polaroidTray, { paddingHorizontal: spacing.xl }]}>
                            {recs.map((item, index) => (
                                <Pressable
                                    key={item.id}
                                    onPress={() => router.push({ pathname: '/product-detail', params: { id: item.id, eventId: firstUpcoming?.id } })}
                                    style={({ pressed }) => [
                                        styles.polaroid,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.ink,
                                            transform: [{ rotate: index % 2 ? '2deg' : '-2deg' }],
                                        },
                                        pressed && styles.pressed,
                                    ]}
                                >
                                    <Image source={{ uri: item.imageUrls?.[0] }} style={styles.polaroidImage} contentFit="cover" />
                                    <View style={[styles.polaroidTape, { backgroundColor: paperColors[index % paperColors.length], borderColor: colors.ink }]} />
                                    <Typography variant="bodyBold" numberOfLines={1}>{item.name}</Typography>
                                    <View style={styles.polaroidFooter}>
                                        <Typography variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ flex: 1 }}>{item.business?.name || 'GiftSync pick'}</Typography>
                                        <Typography variant="label" color={colors.primary}>{formatCurrency(item.price, item.currency)}</Typography>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    ) : giftRequestsEnabled ? (
                        <Pressable
                            onPress={() => router.push({ pathname: '/gift-request', params: { recipient: recipientName(firstUpcoming), occasion: firstUpcoming?.title, eventId: firstUpcoming?.id } })}
                            style={[styles.requestBanner, { marginHorizontal: spacing.xl, backgroundColor: colors.mint, borderColor: colors.ink }]}
                        >
                            <View style={[styles.requestBurst, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={SparklesIcon} size={22} color="#17151D" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Typography variant="h4">Nothing ordinary will do?</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>Make a custom gift request.</Typography>
                            </View>
                            <HugeiconsIcon icon={ArrowRight01Icon} size={22} color={colors.ink} />
                        </Pressable>
                    ) : null}
                </View>}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, overflow: 'hidden' },
    scrollFrame: { flex: 1, overflow: 'hidden' },
    scroll: { flex: 1 },
    decorativeOrb: { position: 'absolute', borderRadius: 999, opacity: 0.42 },
    orbOne: { width: 170, height: 170, top: -72, right: -72 },
    orbTwo: { width: 110, height: 110, top: 420, left: -74 },
    headerShell: { paddingBottom: 12 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 2 },
    miniMark: { width: 25, height: 25, borderRadius: 8, borderWidth: 1.25, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 0.9 },
    pageTitle: { fontSize: 34, lineHeight: 40 },
    notificationButton: { width: 48, height: 48, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', },
    notificationDot: { position: 'absolute', width: 11, height: 11, borderRadius: 6, borderWidth: 1.5, top: 7, right: 7 },
    momentCard: { minHeight: 270, borderWidth: 1.5, borderRadius: 28, overflow: 'hidden', },
    momentColorBlock: { position: 'absolute', width: '27%', height: '100%', left: 0, top: 0, borderRightWidth: 1.5 },
    momentContent: { flex: 1, padding: 22, paddingLeft: '32%' },
    momentKicker: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 18 },
    liveDot: { width: 8, height: 8, borderRadius: 4 },
    recipientTitle: { fontSize: 40, lineHeight: 44 },
    occasionTitle: { fontFamily: 'DMSans_400Regular', marginTop: 3 },
    dateStamp: { position: 'absolute', zIndex: 2, left: 17, top: 20, width: 72, height: 81, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
    stampDay: { fontSize: 29, lineHeight: 31 },
    momentBottom: { marginTop: 'auto', paddingTop: 28, gap: 14 },
    avatarLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    openMoment: { minHeight: 42, borderRadius: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    emptyMoment: { minHeight: 140, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderRadius: 25, },
    emptyMomentIcon: { width: 52, height: 52, borderRadius: 17, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 11 },
    squiggle: { flex: 1, height: 1 },
    bentoRow: { minHeight: 196, flexDirection: 'row', gap: 12 },
    conciergeTile: { flex: 1.15, borderWidth: 1.5, borderRadius: 24, padding: 16, },
    tileIcon: { width: 49, height: 49, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    tileArrow: { position: 'absolute', right: 13, top: 13, width: 34, height: 34, borderRadius: 11, borderWidth: 1.25, alignItems: 'center', justifyContent: 'center' },
    bentoStack: { flex: 0.85, gap: 12 },
    smallTile: { flex: 1, borderWidth: 1.5, borderRadius: 20, padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    smallTileText: { flex: 1, marginRight: 5 },
    sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
    seeAllPill: { height: 34, borderWidth: 1.25, borderRadius: 12, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeline: { position: 'relative' },
    timelineLine: { position: 'absolute', left: 45, top: 22, bottom: 22, width: 2 },
    timelineRow: { minHeight: 94, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    railColumn: { width: 53, alignItems: 'center', zIndex: 2 },
    timelineDot: { width: 34, height: 34, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '5deg' }] },
    dotNumber: { fontFamily: 'DMSans_700Bold' },
    timelineCard: { flex: 1, minHeight: 78, borderWidth: 1.5, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11, },
    timelineDate: { width: 52, minHeight: 47, borderWidth: 1.25, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
    polaroidTray: { gap: 18, paddingTop: 10, paddingBottom: 18 },
    polaroid: { width: 196, padding: 10, paddingBottom: 14, borderWidth: 1.5, borderRadius: 8, },
    polaroidImage: { width: '100%', height: 154, borderWidth: 1, borderColor: '#17151D', marginBottom: 12 },
    polaroidTape: { position: 'absolute', top: 2, left: 70, width: 54, height: 13, borderWidth: 1, transform: [{ rotate: '-3deg' }] },
    polaroidFooter: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
    requestBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderWidth: 1.5, borderRadius: 20, },
    requestBurst: { width: 48, height: 48, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
    pressed: { opacity: 0.86, transform: [{ translateY: 2 }] },
});
