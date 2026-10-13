import GiftOptionsSheet from '@/components/sheets/EventPickerSheet';
import FilterSheet from '@/components/sheets/FilterSheet';
import ShopScreenSkeleton from '@/components/skeletons/ShopScreenSkeleton';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useDebounce } from '@/hooks/useDebounce';
import { useTheme } from '@/hooks/useTheme';
import { useGetUpcomingEventsQuery } from '@/store/api/event';
import { useGetCategoriesQuery, useGetProductsQuery } from '@/store/api/productApi';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { moderateScale } from '@/utils/scaling';
import {
    ArrowRight01Icon,
    CancelCircleIcon,
    FilterIcon,
    Search01Icon,
    SentIcon,
    SparklesIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ShopScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState('All');
    const [sortBy, setSortBy] = useState('Trending');
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(searchQuery);
    const giftSheet = useBottomSheet();
    const filterSheet = useBottomSheet();

    const { data: categoriesData = [], refetch: refetchCategories, isFetching: categoriesFetching } = useGetCategoriesQuery({ hasProductsOnly: true });
    const { data: upcomingEvents = [], refetch: refetchEvents, isFetching: eventsFetching } = useGetUpcomingEventsQuery();
    const categories = [{ id: 'All', name: 'All gifts' }, ...categoriesData];

    const queryParams: Record<string, string | number> = { page, limit: 20 };
    if (activeCategory !== 'All') queryParams.categoryId = activeCategory;
    if (debouncedSearch) queryParams.search = debouncedSearch;
    if (sortBy !== 'Trending') queryParams.sortBy = sortBy.toLowerCase();
    if (priceRange === 'Under $50') queryParams.maxPrice = 50;
    if (priceRange === '$50 - $100') {
        queryParams.minPrice = 50;
        queryParams.maxPrice = 100;
    }
    if (priceRange === 'Over $100') queryParams.minPrice = 100;

    const { data: productsData, isLoading, isFetching: productsFetching, error, refetch: refetchProducts } = useGetProductsQuery(queryParams);

    useEffect(() => setPage(1), [activeCategory, debouncedSearch, priceRange, sortBy]);

    const onRefresh = React.useCallback(() => {
        setPage(1);
        refetchProducts();
        refetchEvents();
        refetchCategories();
    }, [refetchProducts, refetchEvents, refetchCategories]);

    const loadMore = () => {
        if (productsData?.meta && page < productsData.meta.totalPages && !productsFetching) setPage((value) => value + 1);
    };

    const paperColors = [colors.lemon, colors.lilac, colors.mint, colors.peach];

    const renderProduct = ({ item: product, index }: { item: Product; index: number }) => {
        const totalPrice = Number(product.price) + Number(product.deliveryFee) + Number(product.packagingFee);
        const isLeft = index % 2 === 0;
        return (
            <Animated.View
                entering={FadeInDown.delay(Math.min(index * 55, 330)).duration(250)}
                style={[styles.productWrapper, isLeft ? { paddingLeft: spacing.xl, paddingRight: 7 } : { paddingRight: spacing.xl, paddingLeft: 7 }]}
            >
                <Pressable
                    onPress={() => router.push({ pathname: '/product-detail', params: { id: product.id } })}
                    style={({ pressed }) => [
                        styles.productCard,
                        { backgroundColor: colors.surface, borderColor: colors.ink, shadowColor: paperColors[index % paperColors.length] },
                        pressed && styles.pressed,
                    ]}
                >
                    <View style={styles.imageWrap}>
                        <Image source={{ uri: product.imageUrls?.[0] }} style={styles.productImage} contentFit="cover" />
                        <View style={[styles.colorTab, { backgroundColor: paperColors[index % paperColors.length], borderColor: colors.ink }]} />
                    </View>
                    <View style={styles.productContent}>
                        <Typography variant="bodyBold" numberOfLines={2} style={styles.productName}>{product.name}</Typography>
                        <Typography variant="caption" color={colors.textSecondary} numberOfLines={1}>{product.business?.name || 'GiftSync pick'}</Typography>
                        <View style={styles.priceRow}>
                            <Typography variant="label">{formatCurrency(totalPrice, product.currency)}</Typography>
                            <Pressable
                                accessibilityLabel={`Send ${product.name} as a gift`}
                                onPress={(event) => {
                                    event.stopPropagation();
                                    setSelectedProductId(product.id);
                                    giftSheet.open();
                                }}
                                style={[styles.sendButton, { backgroundColor: colors.accent, borderColor: colors.ink }]}
                            >
                                <HugeiconsIcon icon={SentIcon} size={15} color="#17151D" />
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.headerArea, { paddingTop: insets.top + 10, backgroundColor: colors.background }]}>
                <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
                    <View>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE GIFT SHOP</Typography>
                        <Typography variant="h1">Find their thing.</Typography>
                    </View>
                    <View style={[styles.sparkIcon, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={SparklesIcon} size={22} color="#17151D" />
                    </View>
                </View>

                <View style={[styles.searchRow, { paddingHorizontal: spacing.xl }]}>
                    <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={Search01Icon} size={20} color={colors.textSecondary} />
                        <TextInput
                            placeholder="Search gifts, makers, ideas..."
                            placeholderTextColor={colors.textMuted}
                            style={[styles.searchInput, { color: colors.textPrimary }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            returnKeyType="search"
                        />
                        {!!searchQuery && (
                            <Pressable onPress={() => setSearchQuery('')}>
                                <HugeiconsIcon icon={CancelCircleIcon} size={20} color={colors.textSecondary} />
                            </Pressable>
                        )}
                    </View>
                    <Pressable onPress={filterSheet.open} style={[styles.filterButton, { backgroundColor: colors.primary, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={FilterIcon} size={21} color="#FFFFFF" />
                    </Pressable>
                </View>

                <Pressable
                    onPress={() => router.push({ pathname: '/gift-request', params: searchQuery ? { item: searchQuery } : {} })}
                    style={({ pressed }) => [
                        styles.conciergeCard,
                        { marginHorizontal: spacing.xl, backgroundColor: colors.mint, borderColor: colors.ink, shadowColor: colors.ink },
                        pressed && styles.pressed,
                    ]}
                >
                    <View style={[styles.conciergeIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={SparklesIcon} size={24} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Typography variant="h4">Can’t find exactly right?</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>Tell our gift concierge what you need.</Typography>
                    </View>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={22} color={colors.ink} />
                </Pressable>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.categories, { paddingHorizontal: spacing.xl }]}>
                    {categories.map((category) => {
                        const selected = category.id === activeCategory;
                        return (
                            <Pressable
                                key={category.id}
                                onPress={() => setActiveCategory(category.id)}
                                style={[
                                    styles.category,
                                    {
                                        backgroundColor: selected ? colors.ink : colors.surface,
                                        borderColor: colors.ink,
                                    },
                                ]}
                            >
                                <Typography variant="label" color={selected ? colors.surface : colors.textPrimary}>{category.name}</Typography>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            {isLoading ? (
                <ShopScreenSkeleton />
            ) : error ? (
                <View style={styles.centerState}>
                    <Typography variant="h4">The shelves aren’t loading.</Typography>
                    <Typography variant="body" color={colors.textSecondary} align="center">Pull down to try again, or send us a custom request.</Typography>
                </View>
            ) : (
                <FlashList
                    style={styles.productList}
                    data={productsData?.items || []}
                    renderItem={renderProduct}
                    numColumns={2}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
                    refreshing={(productsFetching || eventsFetching || categoriesFetching) && page === 1}
                    onRefresh={onRefresh}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.centerState}>
                            <Typography variant="h3">Nothing matches—yet.</Typography>
                            <Typography variant="body" color={colors.textSecondary} align="center">Make a request and tell us precisely what would make them smile.</Typography>
                            <Pressable onPress={() => router.push({ pathname: '/gift-request', params: { item: searchQuery } })} style={[styles.emptyButton, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                                <Typography variant="bodyBold" color="#17151D">Request a gift</Typography>
                                <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#17151D" />
                            </Pressable>
                        </View>
                    }
                    ListFooterComponent={productsFetching && page > 1 ? <ActivityIndicator color={colors.primary} style={{ padding: 20 }} /> : null}
                />
            )}

            <GiftOptionsSheet
                ref={giftSheet.ref}
                events={upcomingEvents}
                onSelect={(event) => {
                    giftSheet.close();
                    if (selectedProductId) router.push({ pathname: '/checkout', params: { occasionId: event.id, productId: selectedProductId } });
                }}
            />
            <FilterSheet
                ref={filterSheet.ref}
                initialFilters={{ priceRange, sortBy }}
                onApply={(filters) => {
                    setPriceRange(filters.priceRange);
                    setSortBy(filters.sortBy);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerArea: { zIndex: 2 },
    productList: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 1 },
    sparkIcon: { width: 48, height: 48, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '4deg' }] },
    searchRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
    searchBar: { flex: 1, height: 52, borderWidth: 1.5, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
    searchInput: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: moderateScale(15) },
    filterButton: { width: 52, height: 52, borderWidth: 1.5, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    conciergeCard: { marginTop: 16, padding: 14, borderWidth: 1.5, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
    conciergeIcon: { width: 46, height: 46, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    categories: { gap: 9, paddingTop: 18, paddingBottom: 8 },
    category: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 13, borderWidth: 1.5 },
    productWrapper: { width: '100%', marginBottom: 18 },
    productCard: { borderWidth: 1.5, borderRadius: 20, shadowOffset: { width: 4, height: 5 }, shadowOpacity: 1, shadowRadius: 0, elevation: 4 },
    imageWrap: { height: 145, margin: 8, marginBottom: 0 },
    productImage: { width: '100%', height: '100%', borderRadius: 13, borderWidth: 1, borderColor: '#17151D' },
    colorTab: { position: 'absolute', width: 38, height: 12, borderWidth: 1, top: -13, left: 14, transform: [{ rotate: '-5deg' }] },
    productContent: { padding: 12, gap: 3 },
    productName: { minHeight: 46 },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 4 },
    sendButton: { width: 32, height: 32, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    centerState: { paddingHorizontal: 38, paddingTop: 50, alignItems: 'center', gap: 10 },
    emptyButton: { marginTop: 10, minHeight: 48, borderRadius: 15, borderWidth: 1.5, paddingHorizontal: 18, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
    pressed: { opacity: 0.86, transform: [{ translateY: 2 }] },
});
