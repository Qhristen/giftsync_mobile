import FilterSheet from '@/components/sheets/FilterSheet';
import GiftOptionsSheet from '@/components/sheets/OccasionPickerSheet';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useDebounce } from '@/hooks/useDebounce';
import { useTheme } from '@/hooks/useTheme';
import { useGetMonthlyOccasionsQuery, useGetUpcomingOccasionsQuery } from '@/store/api/occasionApi';
import { useGetProductsQuery } from '@/store/api/productApi';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ShopScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery);
    const categoryScrollRef = useRef<ScrollView>(null);
    const [categoryLayouts, setCategoryLayouts] = useState<Record<string, { x: number; width: number }>>({});
    const giftSheet = useBottomSheet();
    const filterSheet = useBottomSheet();

    const queryParams: any = {};
    if (activeCategory !== 'All') queryParams.category = activeCategory;
    if (debouncedSearch) queryParams.search = debouncedSearch;

    const { data: productsData, isLoading, error } = useGetProductsQuery(
        Object.keys(queryParams).length > 0 ? queryParams : undefined
    );
    const { data: upcomingOccasions = [] } = useGetUpcomingOccasionsQuery();

    const categories = ['All', 'Personalised', 'Experiences', 'Jewelry', 'Flowers', 'Tech'];

    const banners = [
        {
            id: '1',
            title: 'Spring Collection',
            subtitle: 'Get up to 30% off on selected items',
            colors: [colors.primary, colors.secondary],
            icon: 'gift'
        },
        {
            id: '2',
            title: 'Personalised Gifts',
            subtitle: 'Make it special with a custom engraving',
            colors: ['#8B5CF6', '#C084FC'],
            icon: 'color-wand'
        },
        {
            id: '3',
            title: 'Experience Days',
            subtitle: 'Unforgettable memories for two',
            colors: ['#F59E0B', '#FCD34D'],
            icon: 'ticket'
        }
    ];

    const renderHeader = () => (
        <View style={{ paddingBottom: spacing.lg }}>
            {/* Header Title */}
            <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingTop: insets.top + spacing.md }]}>
                <Typography variant="h1">Discover</Typography>
                <Typography variant="body" color={colors.textSecondary} style={{ marginTop: 4 }}>
                    Find the perfect gift for any occasion
                </Typography>
            </View>

            {/* Sticky-like Search Bar */}
            <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl, marginBottom: spacing.lg, zIndex: 10 }}>
                <View style={[styles.searchRow, { zIndex: 10 }]}>
                    <View style={[styles.searchBar, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
                        <Ionicons name="search" size={20} color={colors.textMuted} />
                        <TextInput
                            placeholder="Search gifts, experiences..."
                            placeholderTextColor={colors.textMuted}
                            style={[styles.searchInput, { color: colors.textPrimary }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                            </Pressable>
                        )}
                    </View>
                    <Pressable
                        style={[styles.filterBtn, { backgroundColor: colors.primary }]}
                        onPress={() => filterSheet.open()}
                    >
                        <Ionicons name="options-outline" size={24} color="#FFFFFF" />
                    </Pressable>
                </View>
            </View>

            {searchQuery.length === 0 ? (
                <>
                    {/* Hero Banner Carousel */}
                    <View style={{ marginBottom: spacing.xl }}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 16 }}
                            snapToInterval={width - (spacing.xl * 2) + 16}
                            decelerationRate="fast"
                        >
                            {banners.map((banner) => (
                                <Card key={banner.id} style={{ padding: 0, borderRadius: 24, overflow: 'hidden', width: width - (spacing.xl * 2) }}>
                                    <LinearGradient
                                        colors={banner.colors as any}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.heroBanner}
                                    >
                                        <View style={styles.heroContent}>
                                            <Typography variant="h3" color="#FFFFFF">{banner.title}</Typography>
                                            <Typography variant="body" color="#FFFFFF" style={{ opacity: 0.9, marginTop: 4, marginBottom: 16 }}>
                                                {banner.subtitle}
                                            </Typography>
                                            <Button
                                                title="Shop Now"
                                                variant="outline"
                                                size="sm"
                                                style={{ alignSelf: 'flex-start', borderColor: 'rgba(255,255,255,0.5)' }}
                                                // textStyle={{ color: '#FFFFFF' }}
                                                onPress={() => { }}
                                            />
                                        </View>
                                        <Ionicons name={banner.icon as any} size={100} color="rgba(255,255,255,0.15)" style={{ position: 'absolute', right: -20, bottom: -20 }} />
                                    </LinearGradient>
                                </Card>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Dynamic Category Pills */}
                    <ScrollView
                        ref={categoryScrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.md, gap: 10 }}
                    >
                        {categories.map((cat, index) => {
                            const isActive = activeCategory === cat;
                            return (
                                <Pressable
                                    key={cat}
                                    onLayout={(e) => {
                                        const layout = e.nativeEvent.layout;
                                        setCategoryLayouts(prev => ({ ...prev, [cat]: layout }));
                                    }}
                                    onPress={() => {
                                        setActiveCategory(cat);
                                        const layout = categoryLayouts[cat];
                                        if (layout && categoryScrollRef.current) {
                                            categoryScrollRef.current.scrollTo({
                                                x: layout.x - (width / 2) + (layout.width / 2),
                                                animated: true
                                            });
                                        }
                                    }}
                                    style={[
                                        styles.catPill,
                                        {
                                            backgroundColor: isActive ? colors.primary : colors.surfaceRaised,
                                            shadowColor: isActive ? colors.primary : 'transparent',
                                        }
                                    ]}
                                >
                                    <Typography variant="label" color={isActive ? '#FFFFFF' : colors.textPrimary}>{cat}</Typography>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h4">Trending Now</Typography>
                        <Pressable>
                            <Typography variant="label" color={colors.primary}>See All</Typography>
                        </Pressable>
                    </View>
                </>
            ) : (
                <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.md }}>
                    <Typography variant="h4">Search Results for "{searchQuery}"</Typography>
                </View>
            )}
        </View>
    );

    const renderItem = ({ item: product, index }: { item: any, index: number }) => {
        const isLeft = index % 2 === 0;
        return (
            <View style={[
                styles.productWrapper,
                isLeft ? { paddingLeft: spacing.xl, paddingRight: 8 } : { paddingRight: spacing.xl, paddingLeft: 8 }
            ]}>
                <Pressable
                    style={[styles.newProductCard, { backgroundColor: colors.surface }]}
                    onPress={() => router.push(`/(tabs)/shop/${product.id}`)}
                >
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: product.imageUrls?.[0] }} style={styles.productImageFull} contentFit="cover" />
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Typography variant="caption" style={{ fontWeight: 'bold' }}>{product.ratingAvg || '4.5'}</Typography>
                        </View>
                    </View>

                    <View style={styles.cardContent}>
                        <Typography variant="bodyBold" numberOfLines={1}>{product.name}</Typography>
                        <Typography variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ marginTop: 2 }}>{product.business?.name || 'GiftSync Choice'}</Typography>

                        <View style={styles.priceRow}>
                            <Typography variant="bodyBold" color={colors.primary}>{product.currency} {product.price}</Typography>
                            <Pressable
                                style={[styles.miniSendBtn, { backgroundColor: colors.primary + '15' }]}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setSelectedProductId(product.id);
                                    giftSheet.open();
                                }}
                            >
                                <Ionicons name="paper-plane" size={14} color={colors.primary} />
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : error ? (
                <View style={{ flex: 1 }}>
                    {renderHeader()}
                    <Typography variant="body" color={colors.error} style={{ textAlign: 'center', marginTop: 24 }}>
                        Failed to load trending gifts.
                    </Typography>
                </View>
            ) : (
                <FlashList
                    data={productsData?.items || []}
                    renderItem={renderItem}
                    // estimatedItemSize={280}
                    numColumns={2}
                    ListHeaderComponent={renderHeader()}
                    contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item: any) => item.id}
                />
            )}

            <GiftOptionsSheet
                ref={giftSheet.ref}
                occasions={upcomingOccasions}
                onSelect={(occasion) => {
                    giftSheet.close();
                    if (selectedProductId) {
                        router.push({ pathname: '/checkout', params: { occasionId: occasion.id, productId: selectedProductId } });
                    }
                }}
            />

            <FilterSheet ref={filterSheet.ref} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingBottom: 0
    },
    searchRow: {
        flexDirection: 'row',
        gap: 12,
    },
    searchBar: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        fontFamily: 'DMSans_400Regular',
        fontSize: 16,
    },
    filterBtn: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 3,
    },
    heroBanner: {
        minHeight: 180,
        justifyContent: 'center',
        padding: 24,
    },
    heroContent: {
        flex: 1,
        justifyContent: 'center',
        zIndex: 2,
    },
    catPill: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 100,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    productWrapper: {
        width: '100%',
        marginBottom: 16,
    },
    newProductCard: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.02)',
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 150,
    },
    productImageFull: {
        width: '100%',
        height: '100%',
    },
    ratingBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    cardContent: {
        padding: 12,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    miniSendBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
