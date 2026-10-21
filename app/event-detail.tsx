import CreateEventSheet from '@/components/sheets/CreateEventSheet';
import ConfirmDeleteSheet from '@/components/sheets/ConfirmDeleteSheet';
import EventDetailSkeleton from '@/components/skeletons/EventDetailSkeleton';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { useDeleteEventMutation, useGetEventDetailQuery } from '@/store/api/event';
import { useGetRecommendationsV2Query } from '@/store/api/productApi';
import { getCountdown } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Calendar01Icon,
    Delete02Icon,
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
import { toast } from 'sonner-native';
import { moderateScale } from '@/utils/scaling';

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
    const deleteSheet = useBottomSheet();
    const { data: event, isLoading, isFetching, error, refetch } = useGetEventDetailQuery(id, { skip: !id });
    const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();
    const { data: recommendations = [], isLoading: recommendationsLoading } = useGetRecommendationsV2Query(
        { eventId: event?.id as string, limit: 10 },
        { skip: !event?.id || !recommendationsEnabled },
    );

    const handleDelete = async () => {
        if (!id || isDeleting) return;

        try {
            await deleteEvent(id).unwrap();
            deleteSheet.close();
            toast.success('Event deleted');
            router.back();
        } catch (error: unknown) {
            const message = (error as { data?: { message?: string } })?.data?.message;
            toast.error('Could not delete event', { description: message || 'Please try again.' });
        }
    };

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
            <View style={[styles.fixedHeader, { paddingTop: insets.top + moderateScale(10), paddingHorizontal: spacing.xl, backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={[styles.headerButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={moderateScale(22)} color={colors.ink} />
                    </Pressable>
                    <View style={[styles.dossierTab, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                        <Typography variant="caption" color="#17151D" style={styles.overline}>CELEBRATION DOSSIER</Typography>
                    </View>
                    <Pressable onPress={editSheet.open} style={[styles.headerButton, { backgroundColor: colors.lilac, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={Edit01Icon} size={moderateScale(21)} color={colors.ink} />
                    </Pressable>
                </View>
            </View>

            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: moderateScale(50) }}>
                <View style={{ paddingHorizontal: spacing.xl, marginTop: moderateScale(22) }}>
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
                                <Avatar uri={event.contact?.avatar} name={recipient} size={moderateScale(52)} style={{ borderWidth: 1.5, borderColor: colors.ink }} />
                                <View>
                                    <Typography variant="caption" color={colors.textSecondary}>THE COUNTDOWN</Typography>
                                    <Typography variant="bodyBold">{getCountdown(event.date)}</Typography>
                                </View>
                            </View>
                        </View>
                        <View style={[styles.fileClip, { backgroundColor: colors.lilac, borderColor: colors.ink }]} />
                    </View>
                </View>

                <View style={{ paddingHorizontal: spacing.xl, marginTop: moderateScale(20) }}>
                    <View style={[styles.sectionLabel, {paddingTop: moderateScale(10)}]}>
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
                                    <HugeiconsIcon icon={step.icon} size={moderateScale(18)} color={colors.ink} />
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
                            <HugeiconsIcon icon={GiftIcon} size={moderateScale(27)} color={colors.primary} />
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
                            <HugeiconsIcon icon={ArrowRight01Icon} size={moderateScale(21)} color="#17151D" />
                        </Pressable>
                    </View>

                    <View style={styles.conciergeRow}>
                        {giftRequestsEnabled && <Pressable
                            onPress={() => router.push({ pathname: '/gift-request', params: { recipient, occasion: event.title, eventId: event.id } })}
                            style={[styles.conciergeCard, { backgroundColor: colors.peach, borderColor: colors.ink }]}
                        >
                            <HugeiconsIcon icon={SparklesIcon} size={moderateScale(23)} color={colors.ink} />
                            <View style={{ flex: 1 }}>
                                <Typography variant="bodyBold">Request something specific</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>Brief the concierge</Typography>
                            </View>
                            <HugeiconsIcon icon={ArrowRight01Icon} size={moderateScale(18)} color={colors.ink} />
                        </Pressable>}
                    </View>
                </View>

                {recommendationsEnabled && <View style={{ marginTop: moderateScale(36) }}>
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
                        <ActivityIndicator color={colors.primary} style={{ margin: moderateScale(28) }} />
                    ) : recommendations.length ? (
                        <FlashList
                            data={recommendations}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: moderateScale(12), paddingBottom: moderateScale(16) }}
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
                                            <HugeiconsIcon icon={Time02Icon} size={moderateScale(14)} color={colors.success} />
                                            <Typography variant="caption" color={colors.success}>{item.deliveryDays}d</Typography>
                                        </View>
                                    </View>
                                </Pressable>
                            )}
                        />
                    ) : giftRequestsEnabled ? (
                        <Pressable
                            onPress={() => router.push({ pathname: '/gift-request', params: { recipient, occasion: event.title, eventId: event.id } })}
                            style={[styles.noIdeas, { marginHorizontal: spacing.xl, marginTop: spacing.xl, backgroundColor: colors.lilac, borderColor: colors.ink }]}
                        >
                            <View>

                            <Typography variant="h4">No ordinary ideas found.</Typography>
                            <Typography variant="body" color={colors.textSecondary}>Ask the concierge to source something personal.</Typography>
                            </View>
                            <HugeiconsIcon icon={ArrowRight01Icon} size={moderateScale(21)} color={colors.ink} />
                        </Pressable>
                    ) : null}
                </View>}

                <View style={{ paddingHorizontal: spacing.xl, marginTop: moderateScale(28) }}>
                    <Button
                        title="Delete event"
                        variant="outline"
                        color={colors.error}
                        leftIcon={<HugeiconsIcon icon={Delete02Icon} size={moderateScale(19)} color={colors.error} />}
                        onPress={deleteSheet.open}
                    />
                </View>
            </ScrollView>

            <CreateEventSheet ref={editSheet.ref} isEditing occasionId={event.id} onSuccess={refetch} />
            <ConfirmDeleteSheet
                ref={deleteSheet.ref}
                title="Delete this event?"
                description={`“${event.title}” will be permanently removed from your plans.`}
                confirmLabel="Delete event"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    center: { alignItems: 'center', justifyContent: 'center', gap: moderateScale(12) },
    fixedHeader: { zIndex: 2, paddingBottom: moderateScale(5) },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerButton: { width: moderateScale(44), height: moderateScale(44), borderWidth: 1.5, borderRadius: moderateScale(14), alignItems: 'center', justifyContent: 'center' },
    dossierTab: { minHeight: moderateScale(36), borderWidth: 1.5, borderRadius: moderateScale(12), paddingHorizontal: moderateScale(12), alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-1deg' }] },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(0.8) },
    cover: { borderWidth: 1.5, borderRadius: moderateScale(27), overflow: 'hidden', },
    coverBand: { position: 'absolute', left: moderateScale(0), top: moderateScale(0), bottom: moderateScale(0), width: '29%', borderRightWidth: 1.5 },
    datePoster: { position: 'absolute', left: moderateScale(14), top: moderateScale(30), width: moderateScale(88), height: moderateScale(126), borderWidth: 1.5, borderRadius: moderateScale(19), alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
    posterDay: { fontSize: moderateScale(44), lineHeight: moderateScale(48) },
    coverCopy: { flex: 1, padding: moderateScale(22), paddingLeft: '34%', justifyContent: 'center' },
    recipientName: { fontSize: moderateScale(40), lineHeight: moderateScale(44), marginTop: moderateScale(4) },
    personRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(10), marginTop: moderateScale(28) },
    fileClip: { position: 'absolute', width: moderateScale(58), height: moderateScale(16), borderWidth: 1, top: moderateScale(-7), right: moderateScale(36), transform: [{ rotate: '4deg' }] },
    sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(10) },
    sectionRule: { flex: 1, height: moderateScale(1) },
    trail: { position: 'relative', marginTop: moderateScale(14) },
    trailLine: { position: 'absolute', left: moderateScale(21), top: moderateScale(22), bottom: moderateScale(22), width: moderateScale(2) },
    trailRow: { minHeight: moderateScale(76), flexDirection: 'row', alignItems: 'center', gap: moderateScale(12), marginBottom: moderateScale(10) },
    trailDot: { width: moderateScale(44), height: moderateScale(44), borderWidth: 1.5, borderRadius: moderateScale(14), alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    trailCard: { flex: 1, minHeight: moderateScale(68), borderWidth: 1.5, borderRadius: moderateScale(17), padding: moderateScale(12), flexDirection: 'row', alignItems: 'center', gap: moderateScale(8) },
    missionDesk: { marginTop: moderateScale(20), borderWidth: 1.5, borderRadius: moderateScale(22), padding: moderateScale(14), flexDirection: 'row', alignItems: 'center', gap: moderateScale(12), },
    missionIcon: { width: moderateScale(52), height: moderateScale(52), borderWidth: 1.5, borderRadius: moderateScale(17), alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
    missionArrow: { width: moderateScale(42), height: moderateScale(42), borderWidth: 1.25, borderRadius: moderateScale(13), alignItems: 'center', justifyContent: 'center' },
    conciergeRow: { flexDirection: 'row', gap: moderateScale(11), marginTop: moderateScale(14) },
    conciergeCard: { flex: 1, borderWidth: 1.5, borderRadius: moderateScale(18), padding: moderateScale(12), flexDirection: 'row', alignItems: 'center', gap: moderateScale(9) },
    editCard: { width: moderateScale(98), minHeight: moderateScale(84), borderWidth: 1.5, borderRadius: moderateScale(18), padding: moderateScale(10), alignItems: 'center', justifyContent: 'center', gap: moderateScale(5) },
    recommendationHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: moderateScale(10) },
    ideaCard: { width: moderateScale(192), borderWidth: 1.5, borderRadius: moderateScale(9), padding: moderateScale(9), paddingBottom: moderateScale(13), marginRight: moderateScale(17), },
    ideaImage: { width: '100%', height: moderateScale(144), borderWidth: 1, borderColor: '#17151D', marginBottom: moderateScale(10) },
    ideaTape: { position: 'absolute', width: moderateScale(50), height: moderateScale(13), borderWidth: 1, top: moderateScale(3), left: moderateScale(69), transform: [{ rotate: '-4deg' }] },
    ideaFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: moderateScale(5) },
    deliveryTime: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(3) },
    noIdeas: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12), borderWidth: 1.5, borderRadius: moderateScale(21), padding: moderateScale(17),},
    
});
