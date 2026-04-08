import OccasionPickerSheet from '@/components/sheets/OccasionPickerSheet';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useGetUpcomingOccasionsQuery } from '@/store/api/occasionApi';
import { useGetProductByIdQuery } from '@/store/api/productApi';
import { Occasion } from '@/types';
import { calculateDeliveryStatus } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ShopItemDetailScreen() {
    const { id, occasionId } = useLocalSearchParams();
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const [activeIndex, setActiveIndex] = useState(0);
    const occasionSheet = useBottomSheet();

    const { data: upcomingOccasions = [] } = useGetUpcomingOccasionsQuery();
    const { data: product, isLoading, error } = useGetProductByIdQuery(id as string);

    const selectedOccasion = useMemo(() => {
        if (occasionId) return upcomingOccasions.find(o => o.id === occasionId);
        return null;
    }, [occasionId, upcomingOccasions]);

    const deliveryStatus = useMemo(() => {
        if (!product || !selectedOccasion) return null;
        return calculateDeliveryStatus(selectedOccasion.date, product.deliveryDays, selectedOccasion.contact?.name);
    }, [product, selectedOccasion]);

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error || !product) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }]}>
                <Typography variant="h3" color={colors.error} style={{ textAlign: 'center', marginBottom: spacing.md }}>
                    Product not found.
                </Typography>
                <Button title="Go Back" onPress={() => router.back()} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { top: spacing.xl, paddingHorizontal: spacing.xl, backgroundColor: 'transparent' }]}>
                <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.surfaceRaised }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Pressable style={[styles.iconBtn, { backgroundColor: colors.surfaceRaised }]}>
                    <Ionicons name="heart-outline" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Image Gallery */}
                <Animated.View entering={FadeInDown.duration(500)}>
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                        <View style={{ width, height: width * 1.1 }}>
                            <FlashList
                                data={product.imageUrls}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                onMomentumScrollEnd={(e) => {
                                    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
                                }}
                                keyExtractor={(_, i) => i.toString()}
                                renderItem={({ item }) => (
                                    <Image source={{ uri: item as string }} style={{ width, height: width * 1.1 }} contentFit="cover" />
                                )}
                            />
                        </View>
                    ) : (
                        <View style={{ width, height: width * 1.1, backgroundColor: colors.surfaceRaised, justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="image-outline" size={48} color={colors.textMuted} />
                        </View>
                    )}
                    <View style={styles.pagination}>
                        {product.imageUrls?.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    { backgroundColor: i === activeIndex ? colors.primary : 'rgba(255,255,255,0.5)' },
                                    i === activeIndex && { width: 16 }
                                ]}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Details */}
                <Animated.View entering={FadeInUp.delay(200).duration(500)} style={[styles.details, { padding: spacing.xl, backgroundColor: colors.surface }]}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Typography variant="h2">{product.name}</Typography>
                            <Typography variant="h3" color={colors.primary} style={{ marginTop: 4 }}>{formatCurrency(product.price, product.currency)}</Typography>
                        </View>
                        <View style={[styles.ratingBadge, { backgroundColor: colors.surfaceRaised }]}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Typography variant="bodyBold" style={{ marginLeft: 4 }}>{product.ratingAvg || 0}</Typography>
                        </View>
                    </View>

                    <Card variant="outline" style={[styles.vendorCard, { borderColor: colors.border, marginTop: spacing.lg }]}>
                        <Avatar name={product.business?.name || 'Vendor'} size="md" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Typography variant="bodyBold">Sold by {product.business?.name}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>{product.ratingCount || 0} Reviews</Typography>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </Card>

                    {deliveryStatus && (
                        <View style={{ marginTop: spacing.xl }}>
                            <Typography variant="h4" style={{ marginBottom: spacing.md }}>Delivery Status</Typography>
                            <Card
                                variant="elevated"
                                style={[
                                    styles.deliveryCard,
                                    { backgroundColor: deliveryStatus.canArriveOnTime ? colors.success + '15' : colors.error + '15' }
                                ]}
                            >
                                <View style={[styles.deliveryIcon, { backgroundColor: deliveryStatus.canArriveOnTime ? colors.success : colors.error }]}>
                                    <Ionicons
                                        name={deliveryStatus.canArriveOnTime ? "time-outline" : "alert-circle-outline"}
                                        size={20}
                                        color="#FFF"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Typography variant="bodyBold" color={deliveryStatus.canArriveOnTime ? colors.success : colors.error}>
                                        {deliveryStatus.canArriveOnTime ? 'Arrives on time' : 'Might be late'}
                                    </Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>
                                        Estimated arrival: {deliveryStatus.arrivalDate}
                                    </Typography>
                                    <View style={{ height: 4 }} />
                                    <Typography variant="caption" color={colors.textSecondary}>
                                        {deliveryStatus.recipientName}'s event is in {deliveryStatus.daysToOccasion} days. This gift takes {deliveryStatus.deliveryDays} days to deliver.
                                    </Typography>
                                </View>
                            </Card>
                        </View>
                    )}

                    <View style={{ marginTop: spacing.xl }}>
                        <Typography variant="h4" style={{ marginBottom: spacing.sm }}>Category</Typography>
                        <Typography variant="body" color={colors.textSecondary} style={{ lineHeight: 24 }}>
                            {product?.category?.name}
                        </Typography>
                    </View>

                    {product.tags && product.tags.length > 0 && (
                        <View style={{ marginTop: spacing.xl }}>
                            <Typography variant="h4" style={{ marginBottom: spacing.md }}>Tags</Typography>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {product.tags.map((tag, idx) => (
                                    <View key={idx} style={[styles.ratingBadge, { backgroundColor: colors.surfaceRaised }]}>
                                        <Typography variant="caption" color={colors.textPrimary}>{tag}</Typography>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </Animated.View>
                <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <Button
                        title="Send as Gift"
                        variant="primary"
                        style={{ flex: 1 }}
                        leftIcon={<Ionicons name="gift-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />}
                        onPress={() => {
                            if (occasionId) {
                                router.push({ pathname: '/checkout', params: { productId: id, occasionId: occasionId as string } });
                            } else {
                                occasionSheet.open();
                            }
                        }}
                    />
                </View>
            </ScrollView>

            <OccasionPickerSheet
                ref={occasionSheet.ref}
                occasions={upcomingOccasions}
                onSelect={(occasion: Occasion) => {
                    occasionSheet.close();
                    router.push({ pathname: '/checkout', params: { productId: id, occasionId: occasion.id } });
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 24,
        alignSelf: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    details: {
        marginTop: -32,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    vendorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    deliveryCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        gap: 12,
        borderRadius: 16,
    },
    deliveryIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    footer: {
        // position: 'absolute',
        // bottom: 60,
        width: '100%',
        // height: 200,
        padding: 24,
        // borderTopWidth: 1,
        // elevation: 10,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: -2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 10,
    },
});
