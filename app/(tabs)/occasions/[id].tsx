import CreateOccasionSheet from '@/components/sheets/CreateOccasionSheet';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useGetOccasionDetailQuery } from '@/store/api/occasionApi';
import { useGetRecommendationsV2Query } from '@/store/api/productApi';
import { getCountdown } from '@/utils/dateUtils';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function OccasionDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const { data: occasion, isLoading, error, refetch } = useGetOccasionDetailQuery(id as string, { skip: !id });
    const editSheet = useBottomSheet();

    const { data: recs = [], isLoading: isRecsLoading } = useGetRecommendationsV2Query(
        { occasionId: occasion?.id as string, limit: 10 },
        { skip: !occasion?.id }
    );

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!occasion || error) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Typography>Occasion not found</Typography>
                <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Header Area */}
                <View style={[styles.headerBg, { backgroundColor: colors.primary }]}>
                    <View style={[styles.header, { top: spacing.xl, paddingHorizontal: spacing.xl }]}>
                        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </Pressable>
                        <Typography variant="h4" color="#FFF">Occasion Details</Typography>
                        <Pressable style={styles.iconBtn} onPress={() => editSheet.open()}>
                            <Ionicons name="create-outline" size={24} color="#FFF" />
                        </Pressable>
                    </View>

                    <Animated.View entering={FadeInDown.duration(500)} style={styles.heroContent}>
                        <Avatar uri={occasion.contact?.avatar} name={occasion.contact?.name} size="xl" />
                        <Typography variant="h1" color="#FFF" style={{ marginTop: 16 }}>{occasion.contact?.name}</Typography>
                        <Badge label={occasion.type} variant="primary" style={{ marginTop: 8, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    </Animated.View>
                </View>
                <Animated.View entering={FadeInUp.delay(200).duration(500)} style={[styles.content, { padding: spacing.xl }]}>

                    {/* Premium Occasion Summary Card */}
                    <Card style={[styles.premiumCard, { backgroundColor: colors.surfaceRaised }]}>
                        <View style={styles.detailRow}>
                            <View style={[styles.detailIconBg, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="calendar-clear-outline" size={24} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Typography variant="caption" color={colors.textSecondary}>Date of Occasion</Typography>
                                <Typography variant="h4" style={{ marginTop: 2 }}>
                                    {new Date(occasion.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </Typography>
                                <Typography variant="bodyBold" color={colors.primary} style={{ marginTop: 4 }}>
                                    {getCountdown(occasion.date)}
                                </Typography>
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {occasion.notes && (
                            <>
                                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                <View style={styles.detailRow}>
                                    <View style={[styles.detailIconBg, { backgroundColor: colors.primary + '15' }]}>
                                        <Ionicons name="document-text-outline" size={24} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                        <Typography variant="caption" color={colors.textSecondary}>Notes & Preferences</Typography>
                                        <Typography variant="body" style={{ marginTop: 2, lineHeight: 22 }}>
                                            {occasion.notes}
                                        </Typography>
                                    </View>
                                </View>
                            </>
                        )}
                    </Card>

                    {/* Premium Action Banner */}
                    <Animated.View entering={FadeInUp.delay(400).duration(500)} style={{ marginTop: 32 }}>
                        <Typography variant="h3" style={{ marginBottom: 16 }}>Find the Perfect Gift</Typography>
                        <Card style={[styles.collectionCard, { backgroundColor: '#1A1A1A' }]} onPress={() => router.push('/(tabs)/shop')}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800' }}
                                style={[StyleSheet.absoluteFillObject, { opacity: 0.5 }]}
                                contentFit="cover"
                            />
                            <View style={styles.collectionOverlay}>
                                <View>
                                    <Typography variant="h2" color="#FFFFFF">The {occasion.type} Edit</Typography>
                                    <Typography variant="body" color="#FFFFFF" style={{ opacity: 0.8, marginTop: 4 }}>
                                        Exclusive gifts curated for {occasion.contact?.name}
                                    </Typography>
                                </View>
                                <View style={[styles.exploreBtn, { backgroundColor: colors.primary }]}>
                                    <Typography variant="bodyBold" color="#FFFFFF">Explore Collection</Typography>
                                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
                                </View>
                            </View>
                        </Card>
                    </Animated.View>

                    <View style={[styles.sectionHeader, { paddingTop: spacing['4xl'] }]}>
                        <Typography variant="h4">
                            {`Picked for ${occasion.contact?.name}`}
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
                            contentContainerStyle={{ paddingTop: spacing.md }}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Card style={styles.recCard} onPress={() => router.push({ pathname: '/shop/[id]', params: { id: item.id } })}>
                                    <Image
                                        source={{ uri: item.imageUrls?.[0] }}
                                        style={styles.recImage}
                                        contentFit="cover"
                                    />
                                    <View style={{ padding: 12 }}>
                                        <Typography variant="bodyBold" numberOfLines={1}>{item.name}</Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>{item.business?.name}</Typography>
                                        <View style={styles.recFooter}>
                                            <Typography variant="label" color={colors.primary}>{item.currency} {item.price}</Typography>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Ionicons name="time-outline" size={14} color={colors.success} />
                                                <Typography variant="caption" color={colors.success}>{item.deliveryDays}d</Typography>
                                            </View>
                                        </View>
                                        <Button
                                            title="Send as Gift →"
                                            size="sm"
                                            style={{ marginTop: 12 }}
                                            onPress={() => router.push({ pathname: '/shop/[id]', params: { id: item.id, occasionId: occasion.id } })}
                                        />
                                    </View>
                                </Card>
                            )}
                        />
                    ) : (
                        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
                            <Typography variant="body" color={colors.textSecondary}>No recommendations found.</Typography>
                        </View>
                    )}

                </Animated.View>
            </ScrollView>

            <CreateOccasionSheet
                ref={editSheet.ref}
                isEditing
                occasionId={occasion.id}
                onSuccess={() => refetch()}
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBg: {
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        position: 'absolute',
        zIndex: 10,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroContent: {
        alignItems: 'center',
        marginTop: 60,
    },
    content: {
        marginTop: -30,
    },
    premiumCard: {
        padding: 0,
        borderRadius: 24,
        overflow: 'hidden',
        marginTop: 60,
    },
    detailRow: {
        flexDirection: 'row',
        padding: 24,
        alignItems: 'center',
    },
    detailIconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        width: '100%',
    },
    collectionCard: {
        height: 200,
        padding: 0,
        borderRadius: 24,
        overflow: 'hidden',
    },
    collectionOverlay: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    exploreBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 100,
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
});
