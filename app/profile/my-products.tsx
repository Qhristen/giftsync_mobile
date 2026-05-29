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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Switch, View } from 'react-native';
import { useSelector } from 'react-redux';
import { toast } from 'sonner-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

    const renderProductItem = ({ item }: { item: Product }) => (
        <Card style={styles.productCard}>
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
                    <Typography variant="caption" color={colors.textSecondary} numberOfLines={2} style={{ marginTop: 2 }}>
                        {item.description}
                    </Typography>
                    <Typography variant="body" color={colors.primary} style={{ marginTop: 6 }}>
                        {formatCurrency(item.price, item.currency)}
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
            <View style={[styles.header, { borderBottomColor: colors.border + '33' }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h3">My Products</Typography>
                <Pressable onPress={() => router.push('/profile/add-product')}>
                    <Typography variant="body" color={colors.primary}>
                        Add New
                    </Typography>
                </Pressable>
            </View>


            {isLoading && page === 1 ? (
                <View style={{ flex: 1, paddingTop: 20 }}>
                    <ProductListSkeleton />
                </View>
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProductItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    onEndReached={() => {
                        if (!isLoading && !isFetching && meta && page < meta.totalPages) {
                            setPage(prev => prev + 1);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Typography variant="body" color={colors.textSecondary}>No products found.</Typography>
                        </View>
                    }
                    ListFooterComponent={
                        isFetching && page > 1 ? (
                            <View style={{ paddingVertical: 20 }}>
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
                        backgroundColor: colors.primary,
                        bottom: insets.bottom + 24,
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: 56,
                        gap: 8
                    }
                ]}
            >
                <Ionicons name="add" size={24} color="#FFF" />
                <Typography variant="bodyBold" color="#FFF">Add Product</Typography>
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
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    productCard: {
        marginBottom: 16,
        padding: 12,
    },
    productCardContent: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
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
        paddingVertical: 4,
        marginBottom: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ffffff15',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    floatingButton: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        borderRadius: 100,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    }
});
