import GiftOptionsSheet from '@/components/sheets/OccasionPickerSheet'; // Placeholder for GiftOptionsSheet
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useGetMonthlyOccasionsQuery } from '@/store/api/occasionApi';
import { useGetProductsQuery } from '@/store/api/productApi';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function ShopScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const giftSheet = useBottomSheet();
    const { data: productsData, isLoading, error } = useGetProductsQuery(undefined);
    const { data: monthlyOccasions = [] } = useGetMonthlyOccasionsQuery({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });
    const categories = ['All', 'Personalised', 'Experiences', 'Jewelry', 'Flowers', 'Tech'];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Header Search */}
                <View style={[styles.header, { padding: spacing.xl }]}>
                    <Typography variant="h1">Marketplace</Typography>
                    <View style={styles.searchRow}>
                        <View style={[styles.searchBar, { backgroundColor: colors.surfaceRaised }]}>
                            <Ionicons name="search" size={20} color={colors.textMuted} />
                            <TextInput
                                placeholder="What are you looking for?"
                                placeholderTextColor={colors.textMuted}
                                style={[styles.searchInput, { color: colors.textPrimary }]}
                            />
                        </View>
                        <Pressable style={[styles.filterBtn, { backgroundColor: colors.surfaceRaised }]}>
                            <Ionicons name="filter-outline" size={24} color={colors.primary} />
                        </Pressable>
                    </View>
                </View>

                {/* Hero Banner */}
                <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xl, marginTop: spacing.xl }}>
                    <Card variant="elevated" style={[styles.heroBanner, { backgroundColor: colors.secondary }]}>
                        <View style={styles.heroContent}>
                            <Typography variant="h3" color="#FFFFFF">Occasion Gifting</Typography>
                            <Typography variant="body" color="#FFFFFF" style={{ opacity: 0.9 }}>Send the perfect gift in seconds.</Typography>
                            <Button title="Explore Deals" variant="primary" size="sm" style={{ marginTop: 16 }} onPress={() => { }} />
                        </View>
                    </Card>
                </View>

                {/* Category Pills */}
                <View style={{ marginBottom: spacing.xl }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 12 }}>
                        {categories.map((cat, idx) => (
                            <Pressable key={idx} style={[styles.catPill, { backgroundColor: idx === 0 ? colors.primary : colors.surfaceRaised }]}>
                                <Typography variant="label" color={idx === 0 ? '#FFFFFF' : colors.textPrimary}>{cat}</Typography>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Product Grid */}
                <View style={[styles.section, { paddingHorizontal: spacing.xl }]}>
                    <Typography variant="h4" style={{ marginBottom: spacing.md }}>Trending Gifts</Typography>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
                    ) : error ? (
                        <Typography variant="body" color={colors.error} style={{ textAlign: 'center', marginTop: 24 }}>
                            Failed to load products.
                        </Typography>
                    ) : (
                        <View style={styles.grid}>
                            {productsData?.items?.map((product) => (
                                <Card
                                    key={product.id}
                                    style={styles.productCard}
                                    onPress={() => router.push(`/(tabs)/shop/${product.id}`)}
                                >
                                    <Image source={{ uri: product.imageUrls?.[0] }} style={styles.productImage} contentFit="cover" />
                                    <View style={{ padding: 12 }}>
                                        <Typography variant="bodyBold" numberOfLines={1}>{product.name}</Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>{product.business?.name}</Typography>
                                        <View style={styles.productFooter}>
                                            <Typography variant="label" color={colors.primary}>{product.currency} {product.price}</Typography>
                                            <View style={styles.rating}>
                                                <Ionicons name="star" size={14} color="#F59E0B" />
                                                <Typography variant="caption">{product.ratingAvg || 0}</Typography>
                                            </View>
                                        </View>
                                        <Button
                                            title="Send Gift"
                                            size="sm"
                                            style={{ marginTop: 12 }}
                                            onPress={() => {
                                                setSelectedProductId(product.id);
                                                giftSheet.open();
                                            }}
                                        />
                                    </View>
                                </Card>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Gift Picker Sheet Placeholder */}
            <GiftOptionsSheet
                ref={giftSheet.ref}
                occasions={monthlyOccasions}
                onSelect={(occasion) => {
                    giftSheet.close();
                    if (selectedProductId) {
                        router.push({ pathname: '/checkout', params: { occasionId: occasion.id, productId: selectedProductId } });
                    }
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },
    header: { paddingBottom: 0 },
    searchRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    searchBar: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        gap: 12,
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
    },
    heroBanner: {
        height: 180,
        borderRadius: 24,
        justifyContent: 'center',
        padding: 24,
    },
    heroContent: {
        flex: 1,
        justifyContent: 'center',
    },
    catPill: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 100,
    },
    section: {
        marginTop: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    productCard: {
        width: (width - (spacing.xl * 2) - 16) / 2,
        padding: 0,
    },
    productImage: {
        width: '100%',
        height: 140,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    rating: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
});
