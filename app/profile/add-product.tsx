import CategoryPickerSheet from '@/components/sheets/CategoryPickerSheet';
import CurrencyPickerSheet from '@/components/sheets/CurrencyPickerSheet';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useGetBusinessQuery } from '@/store/api/businessApi';
import { useCreateProductMutation } from '@/store/api/productApi';
import { useUploadMutation } from '@/store/api/uploadApi';
import { CreateProductDto } from '@/types';
import { formatInputNumber, getCurrencySymbol, parseCurrencyInput } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';

export default function AddProductScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { colors, spacing } = useTheme();

    const isEditing = !!params.id;
    const categorySheet = useBottomSheet();
    const currencySheet = useBottomSheet();

    const [tagInput, setTagInput] = useState('');

    const { data: business } = useGetBusinessQuery();
    const [createProduct, { isLoading: isSubmitting }] = useCreateProductMutation();
    const [uploadImage, { isLoading: isUploading }] = useUploadMutation();

    const [formData, setFormData] = useState<CreateProductDto>({
        name: (params.name as string) || '',
        description: (params.description as string) || '',
        price: params.price ? parseFloat(params.price as string) : 0,
        currency: (params.currency as string) || 'NGN',
        imageUrls: params.imageUrls ? JSON.parse(params.imageUrls as string) : [],
        categoryId: (params.categoryId as string) || '',
        tags: params.tags ? JSON.parse(params.tags as string) : [],
        isAvailable: params.isAvailable !== undefined ? params.isAvailable === 'true' : true,
        deliveryFee: params.deliveryFee ? parseFloat(params.deliveryFee as string) : 0,
        packagingFee: params.packagingFee ? parseFloat(params.packagingFee as string) : 0,
        deliveryDays: params.deliveryDays ? parseInt(params.deliveryDays as string) : undefined,
    });

    const addTag = () => {
        const trimmed = tagInput.trim().toLowerCase();
        if (trimmed && !formData.tags?.includes(trimmed)) {
            setFormData(prev => ({
                ...prev,
                tags: [...(prev.tags || []), trimmed]
            }));
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags?.filter(t => t !== tagToRemove)
        }));
    };

    const [inputStrings, setInputStrings] = useState({
        price: formData.price > 0 ? formatInputNumber(formData.price.toString()) : '',
        deliveryFee: formData.deliveryFee > 0 ? formatInputNumber(formData.deliveryFee.toString()) : '',
        packagingFee: formData.packagingFee > 0 ? formatInputNumber(formData.packagingFee.toString()) : '',
    });

    const handlePriceChange = (field: 'price' | 'deliveryFee' | 'packagingFee', text: string) => {
        const formatted = formatInputNumber(text);
        const parsed = parseCurrencyInput(text);

        setInputStrings(prev => ({ ...prev, [field]: formatted }));
        setFormData(prev => ({ ...prev, [field]: parsed }));
    };

    const handleSave = async () => {
        // Validation
        if (!formData.name.trim()) {
            toast.error('Product name is required.');
            return;
        }
        if (!formData.categoryId.trim()) {
            toast.error('Category is required.');
            return;
        }
        if (formData.price <= 0) {
            toast.error('Price must be greater than 0.');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Product description is required.');
            return;
        }
        if (formData.imageUrls.length === 0) {
            toast.error('Please add at least one product image.');
            return;
        }
        if (!business?.id) {
            toast.error('No business found. Please set up your business profile first.');
            return;
        }


        try {
            // Upload local images to Cloudinary (skip URLs that are already remote)
            const uploadedUrls: string[] = [];
            for (const uri of formData.imageUrls) {
                if (uri.startsWith('http://') || uri.startsWith('https://')) {
                    // Already a remote URL (e.g. when editing), keep as-is
                    uploadedUrls.push(uri);
                } else {
                    const cloudinaryUrl = await uploadImage(uri).unwrap();
                    uploadedUrls.push(cloudinaryUrl);
                }
            }

            const productData: CreateProductDto = {
                ...formData,
                imageUrls: uploadedUrls,
            };

            await createProduct({
                businessId: business.id,
                data: productData,
            }).unwrap();

            toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully!`);
            router.back();
        } catch (error: any) {
            const message =
                error?.data?.message || error?.message || 'Something went wrong. Please try again.';
            toast.error(message);
        } finally {

        }
    };

    const addImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            toast.error('Permission Denied', {
                description: 'We need access to your photos to upload product images.'
            });
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newUris = result.assets.map(asset => asset.uri);
            setFormData(prev => ({
                ...prev,
                imageUrls: [...prev.imageUrls, ...newUris]
            }));
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
                <View style={[styles.header, { borderBottomColor: colors.border + '33' }]}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </Pressable>
                    <Typography variant="h3">{isEditing ? 'Edit Product' : 'Add Product'}</Typography>
                    <Pressable onPress={handleSave} disabled={isSubmitting || isUploading}>
                        {(isSubmitting || isUploading) ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Typography variant="body" color={colors.primary}>
                                Save
                            </Typography>
                        )}
                    </Pressable>
                </View>

                <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}>
                    <Typography variant="label" style={{ marginBottom: spacing.md }}>Product Images</Typography>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.xl }}>
                        {formData.imageUrls.map((url, idx) => (
                            <View key={idx} style={{ position: 'relative', }}>
                                <Image source={{ uri: url }} style={styles.imageThumb} />
                                <Pressable
                                    onPress={() => setFormData(prev => ({
                                        ...prev,
                                        imageUrls: prev.imageUrls.filter((_, i) => i !== idx)
                                    }))}
                                    style={styles.removeImageBtn}
                                >
                                    <Ionicons name="close-circle" size={24} color={colors.error} />
                                </Pressable>
                            </View>
                        ))}
                        <Pressable onPress={addImage} style={[styles.addImageBtn, { borderColor: colors.border, backgroundColor: colors.surfaceRaised }]}>
                            <Ionicons name="camera-outline" size={32} color={colors.textSecondary} />
                            <Typography variant="caption" color={colors.textSecondary}>Add Image</Typography>
                        </Pressable>
                    </ScrollView>

                    <View style={styles.form}>
                        <Input
                            label="Product Name"
                            placeholder="e.g. Handmade Silk Scarf"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />
                        <Input
                            label="Description"
                            placeholder="Describe your product..."
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={4}
                        />
                        <Pressable onPress={() => categorySheet.open()}>
                            <View pointerEvents="none">
                                <Input
                                    label="Category"
                                    placeholder="Select a category"
                                    value={params.categoryName as string || ""}
                                    editable={false}
                                    rightIcon={<Ionicons name="chevron-down" size={20} color={colors.textSecondary} />}
                                />
                            </View>
                        </Pressable>
                        <Pressable onPress={() => currencySheet.open()}>
                            <View pointerEvents="none">
                                <Input
                                    label="Currency"
                                    value={formData.currency ?? ""}
                                    editable={false}
                                    rightIcon={<Ionicons name="chevron-down" size={20} color={colors.textSecondary} />}
                                />
                            </View>
                        </Pressable>
                        <Input
                            label="Price"
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={inputStrings.price}
                            onChangeText={(text) => handlePriceChange('price', text)}
                            leftIcon={<Typography variant="body" color={colors.textSecondary}>{getCurrencySymbol(formData.currency)}</Typography>}
                        />
                        <Input
                            label="Delivery Fee"
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={inputStrings.deliveryFee}
                            onChangeText={(text) => handlePriceChange('deliveryFee', text)}
                            leftIcon={<Typography variant="body" color={colors.textSecondary}>{getCurrencySymbol(formData.currency)}</Typography>}
                        />
                        <Input
                            label="Packaging Fee"
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={inputStrings.packagingFee}
                            onChangeText={(text) => handlePriceChange('packagingFee', text)}
                            leftIcon={<Typography variant="body" color={colors.textSecondary}>{getCurrencySymbol(formData.currency)}</Typography>}
                        />

                        <Input
                            label="Delivery Days"
                            placeholder="e.g. 3"
                            keyboardType="numeric"
                            value={formData.deliveryDays?.toString() ?? ""}
                            onChangeText={(text) => setFormData({ ...formData, deliveryDays: parseInt(text) || 0 })}
                            rightIcon={<Typography variant="caption" color={colors.textSecondary}>days</Typography>}
                        />

                        <View>
                            <Input
                                label="Tags"
                                placeholder="e.g. organic, handmade"
                                value={tagInput}
                                onChangeText={setTagInput}
                                onSubmitEditing={addTag}
                                // blurOnSubmit={false}
                                rightIcon={
                                    <Pressable onPress={addTag} hitSlop={10}>
                                        <Ionicons name="add-circle" size={24} color={colors.primary} />
                                    </Pressable>
                                }
                            />
                            <View style={styles.tagContainer}>
                                {formData.tags?.map((tag, idx) => (
                                    <View key={idx} style={[styles.tagChip, { backgroundColor: colors.primary + '10' }]}>
                                        <Typography variant="caption" color={colors.primary} style={{ textTransform: 'lowercase' }}>{tag}</Typography>
                                        <Pressable onPress={() => removeTag(tag)} hitSlop={5}>
                                            <Ionicons name="close-circle" size={16} color={colors.primary} />
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        </View>


                        <View style={styles.switchRow}>
                            <Typography variant="body">Available for Purchase</Typography>
                            <Pressable
                                onPress={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                            >
                                <Ionicons
                                    name={formData.isAvailable ? "toggle" : "toggle-outline"}
                                    size={40}
                                    color={formData.isAvailable ? colors.primary : colors.textMuted}
                                />
                            </Pressable>
                        </View>
                    </View>

                    <Button
                        title={(isSubmitting || isUploading) ? 'Saving...' : (isEditing ? 'Update Product' : 'Create Product')}
                        onPress={handleSave}
                        disabled={isSubmitting || isUploading}
                        style={{ marginTop: spacing.xl * 2 }}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            <CategoryPickerSheet
                ref={categorySheet.ref}
                currentCategoryId={formData.categoryId}
                onSelect={(cat) => {
                    setFormData({ ...formData, categoryId: cat.id });
                    router.setParams({ categoryName: cat.name });
                    categorySheet.close();
                }}
            />

            <CurrencyPickerSheet
                ref={currencySheet.ref}
                currentCurrency={formData.currency ?? ""}
                onSelect={(cur) => {
                    setFormData({ ...formData, currency: cur });
                    currencySheet.close();
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
    imageThumb: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 12,
    },
    addImageBtn: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageBtn: {
        position: 'absolute',
        top: -3,
        right: 4,
        zIndex: 10,
    },
    form: {
        gap: 16,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    }
});
