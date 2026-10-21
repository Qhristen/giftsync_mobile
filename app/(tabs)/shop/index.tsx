import GiftOptionsSheet from '@/components/sheets/EventPickerSheet';
import FilterSheet from '@/components/sheets/FilterSheet';
import ShopScreenSkeleton from '@/components/skeletons/ShopScreenSkeleton';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useDebounce } from '@/hooks/useDebounce';
import { useTheme } from '@/hooks/useTheme';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
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
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const EMPTY_LIST: never[] = [];

export default function ShopScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const { enabled: giftRequestsEnabled } = useFeatureFlag('gift_requests');
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState('All');
    const [sortBy, setSortBy] = useState('Trending');
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebounce(searchQuery);
    const {
        ref: giftSheetRef,
        open: openGiftSheet,
        close: closeGiftSheet,
    } = useBottomSheet();
    const filterSheet = useBottomSheet();

    const { data: categoriesData, refetch: refetchCategories, isFetching: categoriesFetching } = useGetCategoriesQuery({ hasProductsOnly: true });
    const { data: upcomingEvents, refetch: refetchEvents, isFetching: eventsFetching } = useGetUpcomingEventsQuery();
    const categories = React.useMemo(
        () => [{ id: 'All', name: 'All gifts' }, ...(categoriesData ?? EMPTY_LIST)],
        [categoriesData],
    );

    const queryParams = React.useMemo(() => {
        const params: Record<string, string | number> = { page, limit: 20 };
        if (activeCategory !== 'All') params.categoryId = activeCategory;
        if (debouncedSearch) params.search = debouncedSearch;
        if (sortBy !== 'Trending') params.sortBy = sortBy.toLowerCase();
        if (priceRange === 'Under $50') params.maxPrice = 50;
        if (priceRange === '$50 - $100') {
            params.minPrice = 50;
            params.maxPrice = 100;
        }
        if (priceRange === 'Over $100') params.minPrice = 100;
        return params;
    }, [activeCategory, debouncedSearch, page, priceRange, sortBy]);

    const { data: productsData, isLoading, isFetching: productsFetching, error, refetch: refetchProducts } = useGetProductsQuery(queryParams);

    useEffect(() => setPage(1), [activeCategory, debouncedSearch, priceRange, sortBy]);

    const onRefresh = React.useCallback(() => {
        setPage(1);
        refetchProducts();
        refetchEvents();
        refetchCategories();
    }, [refetchProducts, refetchEvents, refetchCategories]);

    const loadMore = React.useCallback(() => {
        if (productsData?.meta && page < productsData.meta.totalPages && !productsFetching) setPage((value) => value + 1);
    }, [page, productsData?.meta, productsFetching]);

    const paperColors = React.useMemo(
        () => [colors.lemon, colors.lilac, colors.mint, colors.peach],
        [colors.lemon, colors.lilac, colors.mint, colors.peach],
    );

    const renderProduct = React.useCallback(({ item: product, index }: { item: Product; index: number }) => {
        const totalPrice = Number(product.price) + Number(product.deliveryFee) + Number(product.packagingFee);
        const isLeft = index % 2 === 0;
        return (
            <View
                style={[styles.productWrapper, isLeft ? { paddingLeft: spacing.xl, paddingRight: moderateScale(7) } : { paddingRight: spacing.xl, paddingLeft: moderateScale(7) }]}
            >
                <Pressable
                    onPress={() => router.push({ pathname: '/product-detail', params: { id: product.id } })}
                    style={({ pressed }) => [
                        styles.productCard,
                        { backgroundColor: colors.surface, borderColor: colors.ink },
                        pressed && styles.pressed,
                    ]}
                >
                    <View style={styles.imageWrap}>
                        <Image
                            source={{ uri: product.imageUrls?.[0] }}
                            style={styles.productImage}
                            contentFit="cover"
                            cachePolicy="memory-disk"
                            recyclingKey={product.id}
                        />
                        <View style={[styles.colorTab, { backgroundColor: paperColors[index % paperColors.length], borderColor: colors.ink }]} />
                    </View>
                    <View style={styles.productContent}>
                        <Typography variant="bodyBold" numberOfLines={2} style={styles.productName}>{product.name}</Typography>
                        <View style={styles.priceRow}>
                            <Typography variant="label">{formatCurrency(totalPrice, product.currency)}</Typography>
                            <Pressable
                                accessibilityLabel={`Send ${product.name} as a gift`}
                                onPress={(event) => {
                                    event.stopPropagation();
                                    setSelectedProductId(product.id);
                                    openGiftSheet();
                                }}
                                style={[styles.sendButton, { backgroundColor: colors.accent, borderColor: colors.ink }]}
                            >
                                <HugeiconsIcon icon={SentIcon} size={moderateScale(15)} color="#17151D" />
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </View>
        );
    }, [colors.accent, colors.ink, colors.surface, colors.textSecondary, openGiftSheet, paperColors, router, spacing.xl]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.headerArea, { paddingTop: insets.top + moderateScale(10), backgroundColor: colors.background }]}>
                <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
                    <View>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE GIFT SHOP</Typography>
                        <Typography variant="h1">Find their thing.</Typography>
                    </View>
                    <TouchableOpacity onPress={()=> router.push("/ai-chat")} style={[styles.sparkIcon, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={SparklesIcon} size={moderateScale(22)} color="#17151D" />
                    </TouchableOpacity>
                </View>

                <View style={[styles.searchRow, { paddingHorizontal: spacing.xl }]}>
                    <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={Search01Icon} size={moderateScale(20)} color={colors.textSecondary} />
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
                                <HugeiconsIcon icon={CancelCircleIcon} size={moderateScale(20)} color={colors.textSecondary} />
                            </Pressable>
                        )}
                    </View>
                    <Pressable onPress={filterSheet.open} style={[styles.filterButton, { backgroundColor: colors.primary, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={FilterIcon} size={moderateScale(21)} color="#FFFFFF" />
                    </Pressable>
                </View>

                {giftRequestsEnabled && <Pressable
                    onPress={() => router.push({ pathname: '/gift-request', params: searchQuery ? { item: searchQuery } : {} })}
                    style={({ pressed }) => [
                        styles.conciergeCard,
                        { marginHorizontal: spacing.xl, backgroundColor: colors.mint, borderColor: colors.ink },
                        pressed && styles.pressed,
                    ]}
                >
                    <View style={[styles.conciergeIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={SparklesIcon} size={moderateScale(24)} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Typography variant="h4">Can’t find exactly right?</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>Tell our gift concierge what you need.</Typography>
                    </View>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={moderateScale(22)} color={colors.ink} />
                </Pressable>}

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
                    data={productsData?.items ?? EMPTY_LIST}
                    renderItem={renderProduct}
                    numColumns={2}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: moderateScale(12), paddingBottom: moderateScale(120) }}
                    refreshing={(productsFetching || eventsFetching || categoriesFetching) && page === 1}
                    onRefresh={onRefresh}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.centerState}>
                            <Typography variant="h3">Nothing matches—yet.</Typography>
                            <Typography variant="body" color={colors.textSecondary} align="center">{giftRequestsEnabled ? 'Make a request and tell us precisely what would make them smile.' : 'Try another search or category.'}</Typography>
                            {giftRequestsEnabled && (
                                <Pressable onPress={() => router.push({ pathname: '/gift-request', params: { item: searchQuery } })} style={[styles.emptyButton, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                                    <Typography variant="bodyBold" color="#17151D">Request a gift</Typography>
                                    <HugeiconsIcon icon={ArrowRight01Icon} size={moderateScale(18)} color="#17151D" />
                                </Pressable>
                            )}
                        </View>
                    }
                    ListFooterComponent={productsFetching && page > 1 ? <ActivityIndicator color={colors.primary} style={{ padding: moderateScale(20) }} /> : null}
                />
            )}

            <GiftOptionsSheet
                ref={giftSheetRef}
                events={upcomingEvents ?? EMPTY_LIST}
                onSelect={(event) => {
                    closeGiftSheet();
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
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(1) },
    sparkIcon: { width: moderateScale(48), height: moderateScale(48), borderRadius: moderateScale(15), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '4deg' }] },
    searchRow: { flexDirection: 'row', gap: moderateScale(10), marginTop: moderateScale(18) },
    searchBar: { flex: 1, height: moderateScale(52), borderWidth: 1.5, borderRadius: moderateScale(16), flexDirection: 'row', alignItems: 'center', paddingHorizontal: moderateScale(14), gap: moderateScale(10) },
    searchInput: { flex: 1, fontFamily: 'DMSans_400Regular', fontSize: moderateScale(15) },
    filterButton: { width: moderateScale(52), height: moderateScale(52), borderWidth: 1.5, borderRadius: moderateScale(16), alignItems: 'center', justifyContent: 'center' },
    conciergeCard: { marginTop: moderateScale(16), padding: moderateScale(10), borderWidth: 1.5, borderRadius: moderateScale(20), flexDirection: 'row', alignItems: 'center', gap: moderateScale(12), },
    conciergeIcon: { width: moderateScale(46), height: moderateScale(46), borderRadius: moderateScale(14), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    categories: { gap: moderateScale(9), paddingTop: moderateScale(18), paddingBottom: moderateScale(8) },
    category: { paddingHorizontal: moderateScale(16), paddingVertical: moderateScale(9), borderRadius: moderateScale(13), borderWidth: 1.5 },
    productWrapper: { width: '100%', marginBottom: moderateScale(18) },
    productCard: { borderWidth: 1.5, borderRadius: moderateScale(20), },
    imageWrap: { height: moderateScale(145), margin: moderateScale(8), marginBottom: moderateScale(0) },
    productImage: { width: '100%', height: '100%', borderRadius: moderateScale(13), borderWidth: 1, borderColor: '#17151D' },
    colorTab: { position: 'absolute', width: moderateScale(38), height: moderateScale(12), borderWidth: 1, top: moderateScale(-13), left: moderateScale(14), transform: [{ rotate: '-5deg' }] },
    productContent: { padding: moderateScale(12), gap: moderateScale(3) },
    productName: { minHeight: moderateScale(0), fontSize: moderateScale(15), lineHeight: moderateScale(18) },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: moderateScale(4) },
    sendButton: { width: moderateScale(32), height: moderateScale(32), borderRadius: moderateScale(11), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    centerState: { paddingHorizontal: moderateScale(38), paddingTop: moderateScale(50), alignItems: 'center', gap: moderateScale(10) },
    emptyButton: { marginTop: moderateScale(10), minHeight: moderateScale(48), borderRadius: moderateScale(15), borderWidth: 1.5, paddingHorizontal: moderateScale(18), flexDirection: 'row', gap: moderateScale(8), alignItems: 'center', justifyContent: 'center' },
    pressed: { opacity: 0.86, transform: [{ translateY: moderateScale(2) }] },
});
