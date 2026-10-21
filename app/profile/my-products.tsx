import ConfirmDeleteSheet from '@/components/sheets/ConfirmDeleteSheet';
import ProductListSkeleton from '@/components/skeletons/ProductListSkeleton';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { useDeleteProductMutation, useGetProductsByBusinessQuery, useUpdateProductMutation } from '@/store/api/productApi';
import { Product } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Switch, View } from 'react-native';
import { useSelector } from 'react-redux';
import { toast } from 'sonner-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from '@/utils/scaling';

export default function MyProductsScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const user = useSelector((state: RootState) => state.auth.user);
    const deleteSheet = useBottomSheet();
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [page, setPage] = useState(1);

    const { data: productsData, isLoading, isFetching } = useGetProductsByBusinessQuery(
        { businessId: user?.business?.id || '', page, limit: 10 },
        { skip: !user?.business?.id }
    );

    const products = productsData?.items || [];
    const meta = productsData?.meta;

    const [updateProduct] = useUpdateProductMutation();
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

    const handleToggleAvailability = async (item: Product) => {
        if (!user?.business?.id) return;
        try {
            await updateProduct({
                businessId: user.business.id,
                productId: item.id,
                data: { isAvailable: !item.isAvailable },
            }).unwrap();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to update availability.');
        }
    };

    const handleDelete = async () => {
        if (!productToDelete || !user?.business?.id) {
            if (!user?.business?.id) toast.error('Business ID is missing.');
            deleteSheet.close();
            return;
        }

        try {
            await deleteProduct({
                businessId: user.business.id,
                productId: productToDelete.id
            }).unwrap();
            toast.success('Product deleted successfully!');
            deleteSheet.close();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to delete product.');
        }
    };

    const paper = [colors.lemon, colors.lilac, colors.mint, colors.peach];

    const renderProductItem = ({ item, index }: { item: Product; index: number }) => (
        <Card style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.ink, transform: [{ rotate: index % 2 ? '0.5deg' : '-0.5deg' }] }]}>
            <View style={[styles.colorTab, { backgroundColor: paper[index % paper.length], borderColor: colors.ink }]} />
            <Pressable
                onPress={() => router.push({
                    pathname: '/profile/product-orders',
                    params: { productId: item.id, productName: item.name }
                })}
                style={({ pressed }) => [styles.productCardContent, { opacity: pressed ? 0.7 : 1 }]}
            >
                <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
                <View style={styles.productInfo}>
                    <View style={styles.titleRow}>
                        <Typography variant="h4" numberOfLines={1} style={{ flex: 1 }}>{item.name}</Typography>
                        {/* <Badge variant={item.isAvailable ? 'success' : 'amber'} label={item.isAvailable ? 'In Stock' : 'Out of Stock'} /> */}
                    </View>
                    <Typography variant="caption" color={colors.textSecondary} numberOfLines={2} style={{ marginTop: moderateScale(2) }}>
                        {item.description}
                    </Typography>
                    <Typography variant="body" color={colors.primary} style={{ marginTop: moderateScale(6) }}>
                        {formatCurrency(item.price, item.currency)} · view orders →
                    </Typography>
                </View>
            </Pressable>

            <View style={styles.availabilityRow}>
                <Badge variant={item.isAvailable ? 'success' : 'amber'} label={item.isAvailable ? 'In Stock' : 'Out of Stock'} />
                <Switch
                    value={item.isAvailable}
                    onValueChange={() => handleToggleAvailability(item)}
                    trackColor={{ false: colors.border, true: colors.primary + '66' }}
                    thumbColor={item.isAvailable ? colors.primary : colors.textSecondary}
                />
            </View>

            <View style={styles.actionRow}>
                <Button
                    title="Edit"
                    variant="outline"
                    size="sm"
                    onPress={() => router.push({
                        pathname: '/profile/add-product',
                        params: {
                            id: item.id,
                            name: item.name,
                            price: item.price.toString(),
                            categoryId: item.category?.id,
                            categoryName: item.category?.name,
                            description: item.description || '',
                            imageUrls: JSON.stringify(item.imageUrls),
                            tags: JSON.stringify(item.tags),
                            isAvailable: item.isAvailable ? 'true' : 'false',
                            currency: item.currency,
                            quantity: item.quantity.toString(),
                            deliveryFee: item.deliveryFee.toString(),
                            packagingFee: item.packagingFee.toString(),
                            deliveryDays: item.deliveryDays?.toString() || ''
                        }
                    })}
                    style={{ flex: 1 }}
                />
                <Button
                    title="Delete"
                    variant="ghost"
                    size="sm"
                    color={colors.error}
                    onPress={() => {
                        setProductToDelete(item);
                        deleteSheet.open();
                    }}
                    style={{ flex: 1 }}
                />
            </View>
        </Card>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + moderateScale(10) }]}>
                <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={moderateScale(22)} color={colors.ink} />
                </Pressable>
                <View style={styles.headerCopy}>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>MAKER&apos;S SHELF</Typography>
                    <Typography variant="h2">Your gift catalogue</Typography>
                </View>
                <Pressable onPress={() => router.push('/profile/add-product')} style={[styles.headerAdd, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                    <HugeiconsIcon icon={PlusSignIcon} size={moderateScale(19)} color={colors.ink} />
                </Pressable>
            </View>

            {isLoading && page === 1 ? (
                <View style={{ flex: 1, paddingTop: moderateScale(20) }}>
                    <ProductListSkeleton />
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: spacing.xl, paddingBottom: moderateScale(100) }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={() => {
                        if (!isLoading && !isFetching && meta && page < meta.totalPages) {
                            setPage(prev => prev + 1);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={[styles.emptyContainer, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                            <Typography variant="h3">The shelf is empty.</Typography>
                            <Typography variant="body" color={colors.textSecondary}>Add your first gift to start taking orders.</Typography>
                        </View>
                    }
                    ListFooterComponent={
                        isFetching && page > 1 ? (
                            <View style={{ paddingVertical: moderateScale(20) }}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        ) : null
                    }
                />
            )}

            <ConfirmDeleteSheet
                ref={deleteSheet.ref}
                title="Delete Product"
                description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />

            <Pressable
                onPress={() => router.push('/profile/add-product')}
                style={[
                    styles.floatingButton,
                    {
                        backgroundColor: colors.lime,
                        borderColor: colors.ink,
                        bottom: insets.bottom + moderateScale(24),
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: moderateScale(56),
                        gap: moderateScale(8)
                    }
                ]}
            >
                <HugeiconsIcon icon={PlusSignIcon} size={moderateScale(22)} color={colors.ink} />
                <Typography variant="bodyBold">Add a gift</Typography>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(12),
        paddingBottom: moderateScale(16),
        paddingHorizontal: moderateScale(20),
    },
    headerCopy: { flex: 1 },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(1) },
    backButton: {
        width: moderateScale(44),
        height: moderateScale(44),
        borderWidth: 1.5,
        borderRadius: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-3deg' }],
    },
    headerAdd: { width: moderateScale(42), height: moderateScale(42), borderWidth: 1.5, borderRadius: moderateScale(13), alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '3deg' }] },
    productCard: {
        marginBottom: moderateScale(16),
        padding: moderateScale(12),
        borderWidth: 1.5,
        borderRadius: moderateScale(22),
    },
    colorTab: { position: 'absolute', width: moderateScale(42), height: moderateScale(13), borderWidth: 1, top: moderateScale(-8), left: moderateScale(26), transform: [{ rotate: '-4deg' }], zIndex: 2 },
    productCardContent: {
        flexDirection: 'row',
        gap: moderateScale(12),
        marginBottom: moderateScale(12),
    },
    productImage: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(15),
        borderWidth: 1,
        borderColor: '#17151D',
    },
    productInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    availabilityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: moderateScale(4),
        marginBottom: moderateScale(8),
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ffffff15',
    },
    actionRow: {
        flexDirection: 'row',
        gap: moderateScale(8),
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: moderateScale(60),
        padding: moderateScale(24),
        borderWidth: 1.5,
        borderRadius: moderateScale(22),
        gap: moderateScale(6),
    },
    floatingButton: {
        position: 'absolute',
        bottom: moderateScale(24),
        right: moderateScale(24),
        borderRadius: moderateScale(17),
        borderWidth: 1.5,
        paddingHorizontal: moderateScale(20),
    }
});
