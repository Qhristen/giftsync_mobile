import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useCreateBusinessMutation, useGetBusinessQuery, useUpdateBusinessMutation } from '@/store/api/businessApi';
import { useUploadMutation } from '@/store/api/uploadApi';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';

export default function BusinessInfoScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const { data: business, isLoading: isFetching } = useGetBusinessQuery();
    const [createBusiness, { isLoading: isCreating }] = useCreateBusinessMutation();
    const [updateBusiness, { isLoading: isUpdating }] = useUpdateBusinessMutation();
    const [uploadLogo, { isLoading: isUploading }] = useUploadMutation();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        description: '',
        businessAddress: '',
        websiteUrl: '',
        location: '',
        bankName: '',
        bankAccountName: '',
        bankAccountNumber: '',
        logoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=business`,
        isVerified: false,
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (business) {
            setFormData({
                name: business.name || '',
                email: business.email || '',
                phone: business.phone || '',
                description: business.description || '',
                businessAddress: business.businessAddress || '',
                websiteUrl: business.websiteUrl || '',
                location: business.location || '',
                bankName: business.bankName || '',
                bankAccountName: business.bankAccountName || '',
                bankAccountNumber: business.bankAccountNumber || '',
                logoUrl: business.logoUrl || '',
                isVerified: business.isVerified || false,
            });
        }
    }, [business]);

    const handleSave = async () => {
        try {
            // Strip fields that aren't part of the API DTO
            const { isVerified, location, ...rest } = formData;
            // Remove empty strings — class-validator's @IsOptional() only skips null/undefined, not ''
            const payload = Object.fromEntries(
                Object.entries(rest).filter(([_, v]) => v !== '')
            );

            if (business) {
                await updateBusiness(payload).unwrap();
                toast.success('Business information updated successfully');
            } else {
                await createBusiness({
                    ...payload,

                } as any).unwrap();
                toast.success('Business profile created successfully');
            }
            setIsEditing(false);
        } catch (error: any) {
            console.log(error, "error from business")
            toast.error(error?.data?.message || 'Failed to save business information');
        }
    };

    const handleLogoChange = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            toast.error('We need access to your photos to upload a business logo.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            try {
                const imageUrl = await uploadLogo(result.assets[0].uri).unwrap();
                setFormData(prev => ({ ...prev, logoUrl: imageUrl }));
                toast.success('Logo uploaded successfully');
            } catch (error: any) {
                toast.error(error?.data?.message || 'Failed to upload logo');
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <KeyboardAvoidingView behavior={"padding"}
                style={{ flex: 1 }}>
                <View style={[styles.header, { borderBottomColor: colors.border + '33' }]}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </Pressable>
                    <Typography variant="h3">{business ? 'Business Info' : 'Setup Business'}</Typography>
                    <Pressable onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
                        {business && (
                            <Typography variant="body" color={colors.primary}>
                                {isEditing ? 'Cancel' : 'Edit'}
                            </Typography>
                        )}
                    </Pressable>
                </View>

                {isFetching && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                )}

                {business && (formData.isVerified ? (
                    <View style={[styles.banner, { backgroundColor: colors.success + '15', borderColor: colors.success + '33' }]}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        <Typography variant="body" color={colors.success} style={{ flex: 1, fontWeight: '600' }}>
                            Verified Business
                        </Typography>
                    </View>
                ) : (
                    <View style={[styles.banner, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '33' }]}>
                        <Ionicons name="alert-circle" size={20} color={colors.accent} />
                        <Typography variant="body" color={colors.accent} style={{ flex: 1 }}>
                            Your business is not verified yet. Get verified to reach more customers.
                        </Typography>
                    </View>
                ))}

                <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    <View style={styles.logoSection}>
                        <Avatar
                            name={formData.name}
                            uri={formData.logoUrl}
                            size={100}
                            style={{ marginBottom: spacing.md }}
                        />
                        {(isEditing || !business) && (
                            <Button
                                title={isUploading ? "Uploading..." : "Change Logo"}
                                variant="ghost"
                                size="sm"
                                onPress={handleLogoChange}
                                disabled={isUploading}
                            />
                        )}
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Business Name"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            editable={isEditing || !business}
                            autoCapitalize="words"
                        />
                        <Input
                            label="Business Email"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            editable={isEditing || !business}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Input
                            label="Phone Number"
                            value={formData.phone}
                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                            editable={isEditing || !business}
                            keyboardType="phone-pad"
                        />
                        <Input
                            label="Description"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            editable={isEditing || !business}
                            multiline
                            numberOfLines={3}
                        // textAlignVertical="top"
                        />
                        <Input
                            label="Business Address"
                            value={formData.businessAddress}
                            onChangeText={(text) => setFormData({ ...formData, businessAddress: text })}
                            editable={isEditing || !business}
                        />
                        <Input
                            label="Website URL"
                            value={formData.websiteUrl}
                            onChangeText={(text) => setFormData({ ...formData, websiteUrl: text })}
                            editable={isEditing || !business}
                            keyboardType="default"
                            autoCapitalize="none"
                        />

                        <Typography variant="h4" style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
                            Banking Details
                        </Typography>

                        <Input
                            label="Bank Name"
                            value={formData.bankName}
                            onChangeText={(text) => setFormData({ ...formData, bankName: text })}
                            editable={isEditing || !business}
                        />
                        <Input
                            label="Account Name"
                            value={formData.bankAccountName}
                            onChangeText={(text) => setFormData({ ...formData, bankAccountName: text })}
                            editable={isEditing || !business}
                        />
                        <Input
                            label="Account Number"
                            value={formData.bankAccountNumber}
                            onChangeText={(text) => setFormData({ ...formData, bankAccountNumber: text })}
                            editable={isEditing || !business}
                            keyboardType="phone-pad"
                        />

                        {(isEditing || !business) && (
                            <Button
                                title={business ? "Save Changes" : "Create Business"}
                                onPress={handleSave}
                                isLoading={isCreating || isUpdating}
                                style={{ marginTop: spacing.xl }}
                            />
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    editButton: {
        padding: 4,
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 16,
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    form: {
        gap: 16,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        // backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});
