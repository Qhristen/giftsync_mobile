import CreateEventSheet from '@/components/sheets/CreateEventSheet';
import EventDetailSkeleton from '@/components/skeletons/EventDetailSkeleton';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { useGetEventDetailQuery } from '@/store/api/event';
import { useGetRecommendationsV2Query } from '@/store/api/productApi';
import { getCountdown } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Calendar01Icon,
    Edit01Icon,
    GiftIcon,
    SparklesIcon,
    Time02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const dateParts = (date: string) => ({
    day: new Date(date).toLocaleDateString(undefined, { day: '2-digit' }),
    month: new Date(date).toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
    weekday: new Date(date).toLocaleDateString(undefined, { weekday: 'long' }),
    year: new Date(date).getFullYear(),
    full: new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
});

export default function EventDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { enabled: giftRequestsEnabled } = useFeatureFlag('gift_requests');
    const { enabled: recommendationsEnabled } = useFeatureFlag('gift_recommendations');
    const editSheet = useBottomSheet();
    const { data: event, isLoading, isFetching, error, refetch } = useGetEventDetailQuery(id, { skip: !id });
    const { data: recommendations = [], isLoading: recommendationsLoading } = useGetRecommendationsV2Query(
        { eventId: event?.id as string, limit: 10 },
        { skip: !event?.id || !recommendationsEnabled },
    );

    if (isLoading || isFetching) return <EventDetailSkeleton />;

    if (!event || error) {
        return (
            <View style={[styles.container, styles.center, { backgroundColor: colors.background, padding: spacing.xl }]}>
                <Typography variant="h2">This plan went missing.</Typography>
                <Typography variant="body" color={colors.textSecondary}>It may have been removed.</Typography>
                <Button title="Back to plans" onPress={() => router.back()} />
            </View>
        );
    }

    const date = dateParts(event.date);
    const recipient = event.contact?.name || 'Someone special';
    const paperColors = [colors.lilac, colors.mint, colors.peach, colors.lemon];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.fixedHeader, { paddingTop: insets.top + 10, paddingHorizontal: spacing.xl, backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={[styles.headerButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={colors.ink} />
                    </Pressable>
                    <View style={[styles.dossierTab, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                        <Typography variant="caption" color="#17151D" style={styles.overline}>CELEBRATION DOSSIER</Typography>
                    </View>
                    <Pressable onPress={editSheet.open} style={[styles.headerButton, { backgroundColor: colors.lilac, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={Edit01Icon} size={21} color={colors.ink} />
                    </Pressable>
                </View>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
                <View style={{ paddingHorizontal: spacing.xl, marginTop: 22 }}>
                    <View style={[styles.cover, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <View style={[styles.coverBand, { backgroundColor: colors.lemon, borderRightColor: colors.ink }]} />
                        <View style={[styles.datePoster, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                            <Typography variant="caption" color="#17151D" style={styles.overline}>{date.weekday.toUpperCase()}</Typography>
                            <Typography variant="h1" color="#17151D" style={styles.posterDay}>{date.day}</Typography>
                            <Typography variant="caption" color="#17151D" style={styles.overline}>{date.month} · {date.year}</Typography>
                        </View>
                        <View style={styles.coverCopy}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>{event.title.toUpperCase()}</Typography>
                            <Typography variant="h1" style={styles.recipientName}>{recipient}</Typography>
                            <View style={styles.personRow}>
                                <Avatar uri={event.contact?.avatar} name={recipient} size={52} style={{ borderWidth: 1.5, borderColor: colors.ink }} />
                                <View>
                                    <Typography variant="caption" color={colors.textSecondary}>THE COUNTDOWN</Typography>
                                    <Typography variant="bodyBold">{getCountdown(event.date)}</Typography>
                                </View>
                            </View>
                        </View>
                        <View style={[styles.fileClip, { backgroundColor: colors.lilac, borderColor: colors.ink }]} />
                    </View>
                </View>

                <View style={{ paddingHorizontal: spacing.xl, marginTop: 20 }}>
                    <View style={[styles.sectionLabel, {paddingTop: 10}]}>
                        <Typography variant="caption" color={colors.textSecondary} style={[styles.overline]}>THE PLAN TRAIL</Typography>
                        <View style={[styles.sectionRule, { backgroundColor: colors.ink }]} />
                    </View>
                    <View style={styles.trail}>
                        <View style={[styles.trailLine, { backgroundColor: colors.ink }]} />
                        {[
                            { label: 'Date saved', detail: date.full, icon: Calendar01Icon, color: colors.mint, complete: true },
                            { label: 'Pick their gift', detail: recommendations.length ? `${recommendations.length} ideas waiting` : 'Find something made for them', icon: GiftIcon, color: colors.lilac, complete: false },
                            { label: 'Send the love', detail: 'Choose delivery and add a message', icon: SparklesIcon, color: colors.peach, complete: false },
                        ].map((step, index) => (
                            <View key={step.label} style={styles.trailRow}>
                                <View style={[styles.trailDot, { backgroundColor: step.color, borderColor: colors.ink }]}>
                                    <HugeiconsIcon icon={step.icon} size={18} color={colors.ink} />
                                </View>
                                <View style={[styles.trailCard, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                    <View style={{ flex: 1 }}>
                                        <Typography variant="bodyBold">{step.label}</Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>{step.detail}</Typography>
                                    </View>
                                    <Typography variant="caption" color={step.complete ? colors.success : colors.primary} style={styles.overline}>{step.complete ? 'DONE' : `0${index + 1}`}</Typography>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={[styles.missionDesk, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                        <View style={[styles.missionIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={GiftIcon} size={27} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>YOUR GIFT MISSION</Typography>
                            <Typography variant="h3">Find a {event.title.toLowerCase()} gift</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Explore ideas chosen with {recipient} in mind.</Typography>
                        </View>
                        <Pressable
                            onPress={() => router.push({ pathname: '/(tabs)/shop', params: { occasion: event.title, recipient } })}
                            style={[styles.missionArrow, { backgroundColor: colors.accent, borderColor: colors.ink }]}
                        >
                            <HugeiconsIcon icon={ArrowRight01Icon} size={21} color="#17151D" />
                        </Pressable>
                    </View>

                    <View style={styles.conciergeRow}>
                        {giftRequestsEnabled && <Pressable
                            onPress={() => router.push({ pathname: '/gift-request', params: { recipient, occasion: event.title, eventId: event.id } })}
                            style={[styles.conciergeCard, { backgroundColor: colors.peach, borderColor: colors.ink }]}
                        >
                            <HugeiconsIcon icon={SparklesIcon} size={23} color={colors.ink} />
                            <View style={{ flex: 1 }}>
                                <Typography variant="bodyBold">Request something specific</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>Brief the concierge</Typography>
                            </View>
                            <HugeiconsIcon icon={ArrowRight01Icon} size={18} color={colors.ink} />
                        </Pressable>}
                    </View>
                </View>

                {recommendationsEnabled && <View style={{ marginTop: 36 }}>
                    <View style={[styles.recommendationHeader, { paddingHorizontal: spacing.xl }]}>
                        <View>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE IDEA FILE</Typography>
                            <Typography variant="h2">Picked for {recipient}</Typography>
                        </View>
                        <Pressable onPress={() => router.push('/(tabs)/shop')}>
                            <Typography variant="label" color={colors.primary}>See all</Typography>
                        </Pressable>
                    </View>

                    {recommendationsLoading ? (
                        <ActivityIndicator color={colors.primary} style={{ margin: 28 }} />
                    ) : recommendations.length ? (
                        <FlashList
                            data={recommendations}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: 12, paddingBottom: 16 }}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item, index }) => (
                                <Pressable
                                    onPress={() => router.push({ pathname: '/product-detail', params: { id: item.id, occasionId: event.id } })}
                                    style={[styles.ideaCard, { backgroundColor: colors.surface, borderColor: colors.ink, transform: [{ rotate: index % 2 ? '2deg' : '-2deg' }] }]}
                                >
                                    <Image source={{ uri: item.imageUrls?.[0] }} style={styles.ideaImage} contentFit="cover" />
                                    <View style={[styles.ideaTape, { backgroundColor: paperColors[index % paperColors.length], borderColor: colors.ink }]} />
                                    <Typography variant="bodyBold" numberOfLines={1}>{item.name}</Typography>
                                    <View style={styles.ideaFooter}>
                                        <Typography variant="label" color={colors.primary}>{formatCurrency(Number(item.price) + Number(item.deliveryFee) + Number(item.packagingFee), item.currency)}</Typography>
                                        <View style={styles.deliveryTime}>
                                            <HugeiconsIcon icon={Time02Icon} size={14} color={colors.success} />
                                            <Typography variant="caption" color={colors.success}>{item.deliveryDays}d</Typography>
                                        </View>
                                    </View>
                                </Pressable>
                            )}
                        />
                    ) : giftRequestsEnabled ? (
                        <Pressable
                            onPress={() => router.push({ pathname: '/gift-request', params: { recipient, occasion: event.title, eventId: event.id } })}
                            style={[styles.noIdeas, { marginHorizontal: spacing.xl, backgroundColor: colors.lilac, borderColor: colors.ink }]}
                        >
                            <Typography variant="h4">No ordinary ideas found.</Typography>
                            <Typography variant="body" color={colors.textSecondary}>Ask the concierge to source something personal.</Typography>
                            <HugeiconsIcon icon={ArrowRight01Icon} size={21} color={colors.ink} />
                        </Pressable>
                    ) : null}
                </View>}
            </ScrollView>

            <CreateEventSheet ref={editSheet.ref} isEditing occasionId={event.id} onSuccess={refetch} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
    fixedHeader: { zIndex: 2, paddingBottom: 5 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerButton: { width: 44, height: 44, borderWidth: 1.5, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    dossierTab: { minHeight: 36, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-1deg' }] },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 0.8 },
    cover: { borderWidth: 1.5, borderRadius: 27, overflow: 'hidden', },
    coverBand: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '29%', borderRightWidth: 1.5 },
    datePoster: { position: 'absolute', left: 14, top: 30, width: 88, height: 126, borderWidth: 1.5, borderRadius: 19, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
    posterDay: { fontSize: 44, lineHeight: 48 },
    coverCopy: { flex: 1, padding: 22, paddingLeft: '34%', justifyContent: 'center' },
    recipientName: { fontSize: 40, lineHeight: 44, marginTop: 4 },
    personRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28 },
    fileClip: { position: 'absolute', width: 58, height: 16, borderWidth: 1, top: -7, right: 36, transform: [{ rotate: '4deg' }] },
    sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    sectionRule: { flex: 1, height: 1 },
    trail: { position: 'relative', marginTop: 14 },
    trailLine: { position: 'absolute', left: 21, top: 22, bottom: 22, width: 2 },
    trailRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    trailDot: { width: 44, height: 44, borderWidth: 1.5, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    trailCard: { flex: 1, minHeight: 68, borderWidth: 1.5, borderRadius: 17, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
    missionDesk: { marginTop: 20, borderWidth: 1.5, borderRadius: 22, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, },
    missionIcon: { width: 52, height: 52, borderWidth: 1.5, borderRadius: 17, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
    missionArrow: { width: 42, height: 42, borderWidth: 1.25, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    conciergeRow: { flexDirection: 'row', gap: 11, marginTop: 14 },
    conciergeCard: { flex: 1, borderWidth: 1.5, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
    editCard: { width: 98, minHeight: 84, borderWidth: 1.5, borderRadius: 18, padding: 10, alignItems: 'center', justifyContent: 'center', gap: 5 },
    recommendationHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },
    ideaCard: { width: 192, borderWidth: 1.5, borderRadius: 9, padding: 9, paddingBottom: 13, marginRight: 17, },
    ideaImage: { width: '100%', height: 144, borderWidth: 1, borderColor: '#17151D', marginBottom: 10 },
    ideaTape: { position: 'absolute', width: 50, height: 13, borderWidth: 1, top: 3, left: 69, transform: [{ rotate: '-4deg' }] },
    ideaFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 },
    deliveryTime: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    noIdeas: { minHeight: 112, borderWidth: 1.5, borderRadius: 21, padding: 17, gap: 5 },
});
