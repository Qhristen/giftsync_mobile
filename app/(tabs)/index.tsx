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
import { moderateScale } from '@/utils/scaling';

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

            <View style={[styles.headerShell, { paddingTop: insets.top + moderateScale(12), paddingHorizontal: spacing.xl, paddingBottom: moderateScale(15) }]}>
                <View style={styles.header}>
                    <View>
                        <View style={styles.eyebrowRow}>
                            <View style={[styles.miniMark, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={GiftIcon} size={moderateScale(14)} color="#17151D" />
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
                        <HugeiconsIcon icon={Notification01Icon} size={moderateScale(22)} color={colors.ink} />
                        {!!unreadCount?.count && <View style={[styles.notificationDot, { backgroundColor: colors.accent, borderColor: colors.ink }]} />}
                    </Pressable>
                </View>
            </View>

            <View style={styles.scrollFrame}>
                <ScrollView
                    style={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: moderateScale(120) }}
                    refreshControl={<RefreshControl refreshing={profileLoading || eventsLoading || templatesFetching} onRefresh={onRefresh} tintColor={colors.primary} />}
                >

                {firstUpcoming && nextDate ? (
                    <View style={{ paddingHorizontal: spacing.xl, marginTop: moderateScale(22) }}>
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
                                        <Avatar uri={firstUpcoming.contact?.avatar} name={recipientName(firstUpcoming)} size={moderateScale(46)} style={{ borderWidth: 1.5, borderColor: colors.ink }} />
                                        <View>
                                            <Typography variant="caption" color={colors.textSecondary}>COUNTDOWN</Typography>
                                            <Typography variant="bodyBold">{getCountdown(firstUpcoming.date)}</Typography>
                                        </View>
                                    </View>
                                    <View style={[styles.openMoment, { backgroundColor: colors.ink }]}>
                                        <Typography variant="caption" color={colors.surface} style={{ fontFamily: 'DMSans_700Bold' }}>Open plan</Typography>
                                        <HugeiconsIcon icon={ArrowRight01Icon} size={moderateScale(17)} color={colors.surface} />
                                    </View>
                                </View>
                            </View>
                        </Pressable>
                    </View>
                ) : (
                    <View style={{ paddingHorizontal: spacing.xl, marginTop: moderateScale(22) }}>
                        <Pressable
                            onPress={() => router.push('/(tabs)/events')}
                            style={[styles.emptyMoment, { backgroundColor: colors.lemon, borderColor: colors.ink }]}
                        >
                            <View style={[styles.emptyMomentIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={Add01Icon} size={moderateScale(26)} color={colors.ink} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Typography variant="h2">Start the love list.</Typography>
                                <Typography variant="body" color={colors.textSecondary}>Add a date worth remembering.</Typography>
                            </View>
                            <HugeiconsIcon icon={ArrowRight01Icon} size={moderateScale(23)} color={colors.ink} />
                        </Pressable>
                    </View>
                )}

                <View style={{ paddingHorizontal: spacing.xl, marginTop: moderateScale(28) }}>
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
                                    <HugeiconsIcon icon={SparklesIcon} size={moderateScale(24)} color={colors.primary} />
                                </View>
                                <View style={{ marginTop: 'auto', gap: moderateScale(4) }}>
                                    <Typography variant="h3">Find the impossible</Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>Brief your gift concierge</Typography>
                                </View>
                                <View style={[styles.tileArrow, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                                    <HugeiconsIcon icon={ArrowRight01Icon} size={moderateScale(18)} color="#17151D" />
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
                                <HugeiconsIcon icon={Add01Icon} size={moderateScale(23)} color={colors.ink} />
                            </Pressable>
                            <Pressable
                                onPress={() => router.push('/orders')}
                                style={({ pressed }) => [styles.smallTile, { backgroundColor: colors.lilac, borderColor: colors.ink }, pressed && styles.pressed]}
                            >
                                <View style={styles.smallTileText}>
                                    <Typography variant="bodyBold">Gift trail</Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>Track orders</Typography>
                                </View>
                                <HugeiconsIcon icon={PackageIcon} size={moderateScale(23)} color={colors.ink} />
                            </Pressable>
                        </View>
                </View>
                    </View>

                {upcoming.length > 0 && (
                    <View style={{ marginTop: moderateScale(34) }}>
                        <View style={[styles.sectionHeading, { paddingHorizontal: spacing.xl }]}>
                            <View>
                                <Typography variant="h2">The love line</Typography>
                                <Typography variant="body" color={colors.textSecondary}>Little moments coming your way</Typography>
                            </View>
                            <Pressable onPress={() => router.push('/(tabs)/events')} style={[styles.seeAllPill, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <Typography variant="caption" style={styles.overline}>ALL</Typography>
                                <HugeiconsIcon icon={ArrowRight01Icon} size={moderateScale(15)} color={colors.ink} />
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
                                                marginLeft: index % 2 ? moderateScale(14) : moderateScale(0),
                                                marginRight: index % 2 ? moderateScale(0) : moderateScale(14),
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
                                        <HugeiconsIcon icon={ArrowRight01Icon} size={moderateScale(18)} color={colors.ink} />
                                    </Pressable>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <UpcomingHolidays templates={eventTemplates} />

                {recommendationsEnabled && <View style={{ marginTop: moderateScale(38) }}>
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
                                        <Typography variant="label" color={colors.primary}>{formatCurrency(Number(item.price) + Number(item.deliveryFee) + Number(item.packagingFee), item.currency)}</Typography>
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
                                <HugeiconsIcon icon={SparklesIcon} size={moderateScale(22)} color="#17151D" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Typography variant="h4">Nothing ordinary will do?</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>Make a custom gift request.</Typography>
                            </View>
                            <HugeiconsIcon icon={ArrowRight01Icon} size={moderateScale(22)} color={colors.ink} />
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
    decorativeOrb: { position: 'absolute', borderRadius: moderateScale(999), opacity: 0.42 },
    orbOne: { width: moderateScale(170), height: moderateScale(170), top: moderateScale(-72), right: moderateScale(-72) },
    orbTwo: { width: moderateScale(110), height: moderateScale(110), top: moderateScale(420), left: moderateScale(-74) },
    headerShell: { paddingBottom: moderateScale(12) },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(7), marginBottom: moderateScale(2) },
    miniMark: { width: moderateScale(25), height: moderateScale(25), borderRadius: moderateScale(8), borderWidth: 1.25, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(0.9) },
    pageTitle: { fontSize: moderateScale(34), lineHeight: moderateScale(40) },
    notificationButton: { width: moderateScale(48), height: moderateScale(48), borderRadius: moderateScale(15), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', },
    notificationDot: { position: 'absolute', width: moderateScale(11), height: moderateScale(11), borderRadius: moderateScale(6), borderWidth: 1.5, top: moderateScale(7), right: moderateScale(7) },
    momentCard: { borderWidth: 1.5, borderRadius: moderateScale(28), overflow: 'hidden', },
    momentColorBlock: { position: 'absolute', width: '27%', height: '100%', left: moderateScale(0), top: moderateScale(0), borderRightWidth: 1.5 },
    momentContent: { flex: 1, padding: moderateScale(22), paddingLeft: '32%' },
    momentKicker: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(7), marginBottom: moderateScale(18) },
    liveDot: { width: moderateScale(8), height: moderateScale(8), borderRadius: moderateScale(4) },
    recipientTitle: { fontSize: moderateScale(40), lineHeight: moderateScale(44) },
    occasionTitle: { fontFamily: 'DMSans_400Regular', marginTop: moderateScale(3) },
    dateStamp: { position: 'absolute', zIndex: 2, left: moderateScale(17), top: moderateScale(20), width: moderateScale(72), height: moderateScale(81), borderRadius: moderateScale(18), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
    stampDay: { fontSize: moderateScale(29), lineHeight: moderateScale(31) },
    momentBottom: { marginTop: 'auto', paddingTop: moderateScale(28), gap: moderateScale(14) },
    avatarLabel: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(10) },
    openMoment: { minHeight: moderateScale(42), borderRadius: moderateScale(13), paddingHorizontal: moderateScale(14), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    emptyMoment: {padding: moderateScale(20), flexDirection: 'row', alignItems: 'center', gap: moderateScale(14), borderWidth: 1.5, borderRadius: moderateScale(25), },
    emptyMomentIcon: { width: moderateScale(52), height: moderateScale(52), borderRadius: moderateScale(17), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(10), marginBottom: moderateScale(11) },
    squiggle: { flex: 1, height: moderateScale(1) },
    bentoRow: { minHeight: moderateScale(196), flexDirection: 'row', gap: moderateScale(12) },
    conciergeTile: { flex: 1.15, borderWidth: 1.5, borderRadius: moderateScale(24), padding: moderateScale(16), },
    tileIcon: { width: moderateScale(49), height: moderateScale(49), borderRadius: moderateScale(15), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    tileArrow: { position: 'absolute', right: moderateScale(13), top: moderateScale(13), width: moderateScale(34), height: moderateScale(34), borderRadius: moderateScale(11), borderWidth: 1.25, alignItems: 'center', justifyContent: 'center' },
    bentoStack: { flex: 0.85, gap: moderateScale(12) },
    smallTile: { flex: 1, borderWidth: 1.5, borderRadius: moderateScale(20), padding: moderateScale(13), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    smallTileText: { flex: 1, marginRight: moderateScale(5) },
    sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: moderateScale(12), marginBottom: moderateScale(16) },
    seeAllPill: { height: moderateScale(34), borderWidth: 1.25, borderRadius: moderateScale(12), paddingHorizontal: moderateScale(10), flexDirection: 'row', alignItems: 'center', gap: moderateScale(4) },
    timeline: { position: 'relative' },
    timelineLine: { position: 'absolute', left: moderateScale(45), top: moderateScale(22), bottom: moderateScale(22), width: moderateScale(2) },
    timelineRow: { minHeight: moderateScale(94), flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(12) },
    railColumn: { width: moderateScale(53), alignItems: 'center', zIndex: 2 },
    timelineDot: { width: moderateScale(34), height: moderateScale(34), borderRadius: moderateScale(12), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '5deg' }] },
    dotNumber: { fontFamily: 'DMSans_700Bold' },
    timelineCard: { flex: 1, minHeight: moderateScale(78), borderWidth: 1.5, borderRadius: moderateScale(18), padding: moderateScale(12), flexDirection: 'row', alignItems: 'center', gap: moderateScale(11), },
    timelineDate: { width: moderateScale(52), minHeight: moderateScale(47), borderWidth: 1.25, borderRadius: moderateScale(12), alignItems: 'center', justifyContent: 'center', paddingHorizontal: moderateScale(4) },
    polaroidTray: { gap: moderateScale(18), paddingTop: moderateScale(10), paddingBottom: moderateScale(18) },
    polaroid: { width: moderateScale(196), padding: moderateScale(10), paddingBottom: moderateScale(14), borderWidth: 1.5, borderRadius: moderateScale(8), },
    polaroidImage: { width: '100%', height: moderateScale(154), borderWidth: 1, borderColor: '#17151D', marginBottom: moderateScale(12) },
    polaroidTape: { position: 'absolute', top: moderateScale(2), left: moderateScale(70), width: moderateScale(54), height: moderateScale(13), borderWidth: 1, transform: [{ rotate: '-3deg' }] },
    polaroidFooter: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(5), marginTop: moderateScale(4) },
    requestBanner: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12), padding: moderateScale(16), borderWidth: 1.5, borderRadius: moderateScale(20), },
    requestBurst: { width: moderateScale(48), height: moderateScale(48), borderRadius: moderateScale(15), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-5deg' }] },
    pressed: { opacity: 0.86, transform: [{ translateY: moderateScale(2) }] },
});
