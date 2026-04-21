import HomeScreenSkeleton from '@/components/skeletons/HomeScreenSkeleton';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetUnreadCountQuery } from '@/store/api/notificationApi';
import { useGetMonthlyOccasionsQuery, useGetUpcomingOccasionsQuery } from '@/store/api/occasionApi';
import { useGetRecommendationsV2Query } from '@/store/api/productApi';
import { useGetProfileQuery } from '@/store/api/userApi';
import { getCountdown } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Dimensions, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const { data: profile, isLoading: isProfileLoading, refetch: refetchProfile } = useGetProfileQuery();
    const { data: upcoming = [], isLoading: isUpcomingLoading, refetch: refetchUpcoming } = useGetUpcomingOccasionsQuery();
    const { data: unreadCount, refetch: refetchUnreadCount } = useGetUnreadCountQuery();

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const { data: monthly, isLoading: isMonthlyLoading, refetch: refetchMonthly } = useGetMonthlyOccasionsQuery({
        month: currentMonth,
        year: currentYear
    });

    // Use the first upcoming occasion for specific recommendations, otherwise generic
    const firstUpcoming = upcoming[0];
    const { data: recs = [], isLoading: isRecsLoading, refetch: refetchRecs } = useGetRecommendationsV2Query(
        { occasionId: firstUpcoming?.id as string, limit: 10 },
        { skip: !firstUpcoming || isUpcomingLoading }
    );

    const onRefresh = React.useCallback(() => {
        refetchProfile();
        refetchUpcoming();
        refetchUnreadCount();
        refetchMonthly();
        refetchRecs();
    }, [refetchProfile, refetchUpcoming, refetchUnreadCount, refetchMonthly, refetchRecs]);

    const isLoading = isProfileLoading || isUpcomingLoading;

    if (isLoading) {
        return <HomeScreenSkeleton />;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <Animated.View entering={FadeInDown.duration(600)} style={[styles.header, { padding: spacing.xl, paddingBottom: spacing.md }]}>
                <View>
                    <Typography variant="body" color={colors.textSecondary}>
                        {(() => {
                            const hour = new Date().getHours();
                            if (hour < 12) return 'Good morning';
                            if (hour < 17) return 'Good afternoon';
                            return 'Good evening';
                        })()}, {profile?.name?.split(' ')[0] || 'Alex'} 👋
                    </Typography>
                    <Typography variant="h1">GiftSync</Typography>
                </View>
                <View style={styles.headerIcons}>
                    <Pressable
                        style={[styles.iconBtn, { backgroundColor: colors.surfaceRaised }]}
                        onPress={() => router.push('/notifications')}
                    >
                        <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                        {unreadCount && unreadCount.count > 0 && (
                            <View style={[styles.badge, { backgroundColor: colors.primary }]} />
                        )}
                    </Pressable>
                </View>
            </Animated.View>

            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                style={{}}
                refreshControl={
                    <RefreshControl
                        refreshing={isProfileLoading || isUpcomingLoading || isMonthlyLoading || isRecsLoading}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
            >

                {/* Hero Carousel or Onboarding */}
                {upcoming.length > 0 ? (
                    <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                        <FlashList
                            data={upcoming}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={{ width, paddingHorizontal: spacing.xl }}>
                                    <Card variant="elevated" style={[styles.heroCard, { backgroundColor: colors.primary }]}>
                                        <View style={styles.heroHeader}>
                                            <Avatar uri={item.contact?.avatar} name={item.contact?.name} size="lg" />
                                            <View>
                                                <Typography variant="h3" color="#FFFFFF">{item.contact?.name}</Typography>
                                                <Typography variant="body" color="#FFFFFF" style={{ opacity: 0.9 }}>{item.title}</Typography>
                                            </View>
                                        </View>
                                        <View style={styles.heroFooter}>
                                            <Typography variant="h2" color="#FFFFFF">{getCountdown(item.date)}</Typography>
                                            <Button
                                                title="Get a Gift →"
                                                variant="secondary"
                                                size="sm"
                                                onPress={() => router.push({
                                                    pathname: '/(tabs)/shop',
                                                })}
                                            />
                                        </View>
                                    </Card>
                                </View>
                            )}
                        />
                    </Animated.View>
                ) : (
                    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={{ paddingHorizontal: spacing.xl }}>
                        <Card variant="elevated" style={[styles.onboardingCard, { backgroundColor: colors.surfaceRaised }]}>
                            <View style={styles.onboardingContent}>
                                <View style={[styles.onboardingIcon, { backgroundColor: colors.primary + '15' }]}>
                                    <Ionicons name="gift-outline" size={32} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1, gap: 4 }}>
                                    <Typography variant="h3">Never miss a moment</Typography>
                                    <Typography variant="body" color={colors.textSecondary}>
                                        Add your first contact and we'll help you track their special occasions with personalized gift ideas.
                                    </Typography>
                                </View>
                            </View>
                            <Button
                                title="Add Your First Occasion"
                                onPress={() => router.push('/(tabs)/occasions')}
                                style={{ marginTop: 8 }}
                            />
                        </Card>
                    </Animated.View>
                )}

                {/* Quick Actions */}
                <Animated.View entering={FadeInDown.delay(400).duration(600)} style={[styles.quickActions, { padding: spacing.xl }]}>
                    {[
                        { label: 'AI Chat', icon: 'sparkles-outline', route: '/ai-chat' },
                        { label: 'Browse Holidays', icon: 'gift-outline', route: '/global-occasions' },
                        { label: 'View Orders', icon: 'list-outline', route: '/orders' },
                        { label: 'Coins', icon: 'coins', route: '/wallet' }
                    ].map((act, idx) => (
                        <Pressable
                            key={idx}
                            style={styles.actionBtn}
                            onPress={() => {
                                router.push(act.route as any);
                            }}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: colors.surfaceRaised }]}>
                                {act.icon === 'coins' ? (
                                    <FontAwesome5 name="coins" size={22} color={colors.primary} />
                                ) : (
                                    <Ionicons name={act.icon as any} size={24} color={colors.primary} />
                                )}
                            </View>
                            <Typography variant="caption" color={colors.textSecondary} align="center">{act.label}</Typography>
                        </Pressable>
                    ))}
                </Animated.View>

                {/* This Month's Occasions */}
                {(monthly?.items?.length ?? 0) > 0 && (
                    <Animated.View entering={FadeInDown.delay(500).duration(600)} style={{ paddingHorizontal: spacing.xl }}>
                        <Typography variant="h4" style={{ marginBottom: spacing.md }}>This Month</Typography>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                            {monthly?.items?.map((occ) => (
                                <Pressable key={occ.id} onPress={() => router.push({ pathname: '/(tabs)/occasions/[id]', params: { id: occ.id } })}>
                                    <Badge label={occ.contact?.name || ""} outline variant="primary" />
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Animated.View>
                )}

                {/* AI Recommendations */}
                <Animated.View entering={FadeInDown.delay(600).duration(600)} style={{ marginTop: 20 }}>
                    <View style={[styles.sectionHeader, { paddingHorizontal: spacing.xl }]}>
                        <Typography variant="h4">
                            {firstUpcoming ? `Picked for ${firstUpcoming.contact?.name}` : 'Recommendations'}
                        </Typography>
                        <Pressable onPress={() => router.push('/(tabs)/shop')}><Typography variant="label" color={colors.primary}>See all →</Typography></Pressable>
                    </View>

                    {isRecsLoading ? (
                        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                            <ActivityIndicator size="small" color={colors.primary} />
                        </View>
                    ) : recs.length > 0 ? (
                        <FlashList
                            data={recs}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: spacing.md, gap: 16, paddingTop: spacing.md }}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Card style={styles.recCard}>
                                    <Image
                                        source={{ uri: item.imageUrls?.[0] }}
                                        style={styles.recImage}
                                        contentFit="cover"
                                    />
                                    <View style={{ padding: 12 }}>
                                        <Typography variant="bodyBold" numberOfLines={1}>{item.name}</Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>{item.business?.name}</Typography>
                                        <View style={styles.recFooter}>
                                            <Typography variant="label" color={colors.primary}>{formatCurrency(item.price, item.currency)}</Typography>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Ionicons name="time-outline" size={14} color={colors.success} />
                                                <Typography variant="caption" color={colors.success}>{item.deliveryDays}d</Typography>
                                            </View>
                                        </View>
                                        <Button
                                            title="Send as Gift →"
                                            size="sm"
                                            style={{ marginTop: 12 }}
                                            onPress={() => router.push({ pathname: `/(tabs)/shop/[id]`, params: { occasionId: firstUpcoming?.id, id: item.id } })}
                                        />
                                    </View>
                                </Card>
                            )}
                        />
                    ) : (
                        <View style={{ paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, alignItems: 'center', gap: 12 }}>
                            <Ionicons name="sparkles-outline" size={32} color={colors.textSecondary} style={{ opacity: 0.5 }} />
                            <Typography variant="body" color={colors.textSecondary} align="center">
                                Once you add an occasion, we'll suggest the perfect gifts right here.
                            </Typography>
                        </View>
                    )}
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 25,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: 10,
        right: 12,
    },
    heroCard: {
        paddingLeft: 18,
        paddingRight: 18,
        paddingBottom: 18,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        gap: 20,
    },
    heroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    heroFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    actionBtn: {
        alignItems: 'center',
        gap: 8,
        width: (width - 64) / 4,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recCard: {
        width: 220,
        padding: 0,
        marginRight: 16,
    },
    recImage: {
        width: '100%',
        height: 140,
    },
    recFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    onboardingCard: {
        padding: 24,
        borderRadius: 24,
        gap: 20,
    },
    onboardingContent: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'flex-start',
    },
    onboardingIcon: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
