import OccasionPickerSheet from '@/components/sheets/OccasionPickerSheet';
import VendorDetailSheet from '@/components/sheets/VendorDetailSheet';
import ShopItemDetailSkeleton from '@/components/skeletons/ShopItemDetailSkeleton';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useGetBusinessReviewsQuery } from '@/store/api/businessApi';
import { useGetUpcomingOccasionsQuery } from '@/store/api/occasionApi';
import { useGetProductByIdQuery } from '@/store/api/productApi';
import { Occasion } from '@/types';
import { calculateDeliveryStatus } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ShopItemDetailScreen() {
    const { id, occasionId } = useLocalSearchParams();
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const [activeIndex, setActiveIndex] = useState(0);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const occasionSheet = useBottomSheet();
    const vendorSheet = useBottomSheet();

    const toggleDescription = useCallback(() => setDescriptionExpanded(v => !v), []);

    const { data: upcomingOccasions = [] } = useGetUpcomingOccasionsQuery();
    const { data: product, isLoading, isFetching, error } = useGetProductByIdQuery(id as string);

    const { data: reviews, isLoading: isLoadingReviews } = useGetBusinessReviewsQuery(
        { businessId: product?.business?.id! },
        { skip: !product?.business?.id }
    );

    const totalPrice = Number(product?.price) + Number(product?.deliveryFee) + Number(product?.packagingFee)

    const selectedOccasion = useMemo(() => {
        if (occasionId) return upcomingOccasions.find(o => o.id === occasionId);
        return null;
    }, [occasionId, upcomingOccasions]);

    const deliveryStatus = useMemo(() => {
        if (!product || !selectedOccasion) return null;
        return calculateDeliveryStatus(selectedOccasion.date, product.deliveryDays, selectedOccasion.contact?.name);
    }, [product, selectedOccasion]);

    if (isLoading || isFetching) {
        return <ShopItemDetailSkeleton />;
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
                {/* <Pressable style={[styles.iconBtn, { backgroundColor: colors.surfaceRaised }]}>
                    <Ionicons name="heart-outline" size={24} color={colors.textPrimary} />
                </Pressable> */}
            </View>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 0 }}>
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
                                    {
                                        backgroundColor: i === activeIndex ? colors.primary : 'rgba(255,255,255,0.9)',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 2,
                                        elevation: 3,
                                    },
                                    i === activeIndex && { width: 20 }
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
                            <Typography variant="h3" color={colors.primary} style={{ marginTop: 4 }}>
                                {formatCurrency(totalPrice, product.currency)}
                            </Typography>
                        </View>
                        {/* <View style={[styles.ratingBadge, { backgroundColor: colors.surfaceRaised }]}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Typography variant="bodyBold" style={{ marginLeft: 4 }}>{product.ratingAvg || 0}</Typography>
                        </View> */}
                    </View>

                    <Pressable onPress={() => vendorSheet.open()}>
                        <Card variant="outline" style={[styles.vendorCard, { borderColor: colors.border, marginTop: spacing.lg }]}>
                            <Avatar name={product.business?.name || 'Vendor'} size="md" />
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Typography variant="bodyBold">Sold by {product.business?.name}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>{product.ratingCount || 0} Reviews</Typography>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                        </Card>
                    </Pressable>

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

                    {/* Description */}
                    {product.description && (
                        <View style={{ marginTop: spacing.xl }}>
                            <Typography variant="h4" style={{ marginBottom: spacing.sm }}>Description</Typography>
                            <Typography
                                variant="body"
                                color={colors.textSecondary}
                                style={{ lineHeight: 24 }}
                                numberOfLines={descriptionExpanded ? undefined : 4}
                            >
                                {product.description}
                            </Typography>
                            <Pressable onPress={toggleDescription} style={{ marginTop: 6 }}>
                                <Typography variant="bodyBold" color={colors.primary}>
                                    {descriptionExpanded ? 'Show less' : 'Read more'}
                                </Typography>
                            </Pressable>
                        </View>
                    )}

                    {/* Product Details */}
                    <View style={{ marginTop: spacing.xl }}>
                        <Typography variant="h4" style={{ marginBottom: spacing.md }}>Product Details</Typography>
                        <Card variant="outline" style={[styles.detailsCard, { borderColor: colors.border }]}>
                            <View style={styles.detailRow}>
                                <View style={[styles.detailIcon, { backgroundColor: colors.primary + '15' }]}>
                                    <Ionicons name="cube-outline" size={18} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Typography variant="caption" color={colors.textSecondary}>Availability</Typography>
                                    <Typography variant="bodyBold" color={product.isAvailable ? colors.success : colors.error}>
                                        {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                                    </Typography>
                                </View>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={styles.detailRow}>
                                <View style={[styles.detailIcon, { backgroundColor: colors.primary + '15' }]}>
                                    <Ionicons name="bicycle-outline" size={18} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Typography variant="caption" color={colors.textSecondary}>Delivery Time</Typography>
                                    <Typography variant="bodyBold">{product.deliveryDays} {product.deliveryDays === 1 ? 'day' : 'days'}</Typography>
                                </View>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={styles.detailRow}>
                                <View style={[styles.detailIcon, { backgroundColor: colors.primary + '15' }]}>
                                    <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Typography variant="caption" color={colors.textSecondary}>Item Price</Typography>
                                    <Typography variant="bodyBold">{formatCurrency(totalPrice, product.currency)}</Typography>
                                </View>
                            </View>

                        </Card>
                    </View>

                    {/* Tags */}
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
                <View style={[styles.footer, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 80 }]}>
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

            {/* Sticky Footer — sits above the absolute-positioned floating tab bar                 (tab bar: ~55px tall + 15px margin + device bottom inset) */}

            <OccasionPickerSheet
                ref={occasionSheet.ref}
                occasions={upcomingOccasions}
                onSelect={(occasion: Occasion) => {
                    occasionSheet.close();
                    router.push({ pathname: '/checkout', params: { productId: id, occasionId: occasion.id } });
                }}
            />

            <VendorDetailSheet
                ref={vendorSheet.ref}
                business={product.business}
                ratingAvg={product?.ratingAvg}
                ratingCount={product?.ratingCount}
                reviews={reviews}
                isLoadingReviews={isLoadingReviews}
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
        bottom: 54,
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
    detailsCard: {
        padding: 0,
        overflow: 'hidden',
        borderRadius: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    detailIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        marginHorizontal: 14,
    },
    footer: {
        width: '100%',
        paddingHorizontal: 24,
        paddingTop: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
});
