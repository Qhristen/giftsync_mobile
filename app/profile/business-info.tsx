import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useCreateBusinessMutation, useGetBusinessQuery, useUpdateBusinessMutation } from '@/store/api/businessApi';
import { useUploadMutation } from '@/store/api/uploadApi';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
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
        isRegistered: false,
        cacNumber: '',
        taxNumber: '',
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
                isRegistered: business.isRegistered || false,
                cacNumber: business.cacNumber || '',
                taxNumber: business.taxNumber || '',
            });
        }
    }, [business]);

    useEffect(() => {
        const getBackgroundLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Permission to access location was denied');
                    return;
                }

                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                const locationStr = `${loc.coords.latitude},${loc.coords.longitude}`;
                setFormData(prev => ({ ...prev, location: locationStr }));
            } catch (error) {
                console.log('Error getting location:', error);
            }
        };

        getBackgroundLocation();
    }, []);

    const handleSave = async () => {
        try {
            // Strip fields that aren't part of the API DTO
            const { isVerified, isRegistered, ...rest } = formData;
            // Remove empty strings — class-validator's @IsOptional() only skips null/undefined, not ''
            const payload = Object.fromEntries(
                Object.entries(rest).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
            );

            if (business) {
                await updateBusiness({ id: business.id, ...payload }).unwrap();
                toast.success('Business information updated successfully');
            } else {
                await createBusiness(payload as any).unwrap();
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

    const InfoSection = ({ title, children, icon }: { title: string, children: React.ReactNode, icon?: string }) => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                {icon && <Ionicons name={icon as any} size={20} color={colors.primary} />}
                <Typography variant="h4" style={{ fontWeight: '700' }}>{title}</Typography>
            </View>
            <View style={styles.sectionContent}>{children}</View>
        </View>
    );

    const DetailItem = ({ label, value, icon }: { label: string, value: string | boolean | undefined, icon?: string }) => (
        <View style={styles.detailItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                {icon && <Ionicons name={icon as any} size={14} color={colors.textSecondary} />}
                <Typography variant="label" color={colors.textSecondary}>{label}</Typography>
            </View>
            <Typography variant="body" style={{ fontWeight: '500' }}>
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || 'Not provided')}
            </Typography>
        </View>
    );

    const showForm = isEditing || !business;

    return (
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
            <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
                <View style={[styles.header, { borderBottomColor: colors.border + '33' }]}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                    </Pressable>
                    <Typography variant="h3">{business ? (isEditing ? 'Edit Business' : 'Business Info') : 'Setup Business'}</Typography>
                    <Pressable onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
                        {business && (
                            <Typography variant="body" color={colors.primary} style={{ fontWeight: '600' }}>
                                {isEditing ? 'Cancel' : 'Edit'}
                            </Typography>
                        )}
                    </Pressable>
                </View>

                {isFetching && (
                    <View style={[styles.loadingOverlay, { backgroundColor: colors.background + '80' }]}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                )}

                <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                    {business && (formData.isVerified ? (
                        <View style={[styles.banner, { backgroundColor: colors.success + '10', borderColor: colors.success + '20' }]}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                            <Typography variant="body" color={colors.success} style={{ flex: 1, fontWeight: '600' }}>
                                Verified Business
                            </Typography>
                        </View>
                    ) : (
                        <View style={[styles.banner, { backgroundColor: colors.accent + '10', borderColor: colors.accent + '20' }]}>
                            <Ionicons name="alert-circle" size={20} color={colors.accent} />
                            <Typography variant="body" color={colors.accent} style={{ flex: 1 }}>
                                Your business is not verified yet. Get verified to reach more customers.
                            </Typography>
                        </View>
                    ))}

                    <View style={styles.logoSection}>
                        <Avatar
                            name={formData.name}
                            uri={formData.logoUrl}
                            size={100}
                        />
                        {showForm && (
                            <Button
                                title={isUploading ? "Uploading..." : "Change Logo"}
                                variant="ghost"
                                size="sm"
                                onPress={handleLogoChange}
                                disabled={isUploading}
                                style={{ marginTop: spacing.sm }}
                            />
                        )}
                    </View>

                    <View style={{ paddingHorizontal: spacing.xl }}>
                        <InfoSection title="Basic Information" icon="business-outline">
                            {showForm ? (
                                <>
                                    <Input
                                        label="Business Name"
                                        value={formData.name}
                                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                                        autoCapitalize="words"
                                    />
                                    <Input
                                        label="Business Email"
                                        value={formData.email}
                                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                        keyboardType="phone-pad"
                                    />
                                    <Input
                                        label="Description"
                                        value={formData.description}
                                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                                        multiline
                                        numberOfLines={3}
                                    />
                                    <Input
                                        label="Business Address"
                                        value={formData.businessAddress}
                                        onChangeText={(text) => setFormData({ ...formData, businessAddress: text })}
                                    />
                                    <Input
                                        label="Website URL"
                                        value={formData.websiteUrl}
                                        onChangeText={(text) => setFormData({ ...formData, websiteUrl: text })}
                                        keyboardType="default"
                                        autoCapitalize="none"
                                    />
                                </>
                            ) : (
                                <>
                                    <DetailItem label="Business Name" value={formData.name} />
                                    <DetailItem label="Email Address" value={formData.email} />
                                    <DetailItem label="Phone Number" value={formData.phone} />
                                    <DetailItem label="Address" value={formData.businessAddress} />
                                    <DetailItem label="Website" value={formData.websiteUrl} />
                                    <DetailItem label="About" value={formData.description} />
                                </>
                            )}
                        </InfoSection>

                        <InfoSection title="Legal & Registration" icon="document-text-outline">
                            {showForm ? (
                                <>
                                    <View style={[styles.toggleRow, { backgroundColor: colors.surfaceRaised }]}>
                                        <Typography variant="body">Is your business registered?</Typography>
                                        <Pressable
                                            onPress={() => setFormData({ ...formData, isRegistered: !formData.isRegistered })}
                                            style={[styles.toggle, { backgroundColor: formData.isRegistered ? colors.primary : colors.surfaceRaised }]}
                                        >
                                            <View style={[styles.toggleThumb, { transform: [{ translateX: formData.isRegistered ? 20 : 0 }] }]} />
                                        </Pressable>
                                    </View>

                                    {formData.isRegistered && (
                                        <View style={{ gap: 16, marginTop: 8 }}>
                                            <Input
                                                label="CAC Number"
                                                value={formData.cacNumber}
                                                onChangeText={(text) => setFormData({ ...formData, cacNumber: text })}
                                                placeholder="RC1234567"
                                            />
                                            <Input
                                                label="Tax Identification Number (TIN)"
                                                value={formData.taxNumber}
                                                onChangeText={(text) => setFormData({ ...formData, taxNumber: text })}
                                                placeholder="12345678-0001"
                                            />
                                        </View>
                                    )}
                                </>
                            ) : (
                                <>
                                    <DetailItem label="Registration Status" value={formData.isRegistered ? "Registered" : "Not Registered"} />
                                    {formData.isRegistered && (
                                        <>
                                            <DetailItem label="CAC Number" value={formData.cacNumber} />
                                            <DetailItem label="TIN" value={formData.taxNumber} />
                                        </>
                                    )}
                                </>
                            )}
                        </InfoSection>

                        <InfoSection title="Financial Details" icon="wallet-outline">
                            {showForm ? (
                                <>
                                    <Input
                                        label="Bank Name"
                                        value={formData.bankName}
                                        onChangeText={(text) => setFormData({ ...formData, bankName: text })}
                                    />
                                    <Input
                                        label="Account Name"
                                        value={formData.bankAccountName}
                                        onChangeText={(text) => setFormData({ ...formData, bankAccountName: text })}
                                    />
                                    <Input
                                        label="Account Number"
                                        value={formData.bankAccountNumber}
                                        onChangeText={(text) => setFormData({ ...formData, bankAccountNumber: text })}
                                        keyboardType="phone-pad"
                                    />
                                </>
                            ) : (
                                <>
                                    <DetailItem label="Bank Name" value={formData.bankName} />
                                    <DetailItem label="Account Name" value={formData.bankAccountName} />
                                    <DetailItem label="Account Number" value={formData.bankAccountNumber} />
                                </>
                            )}
                        </InfoSection>

                        {showForm && (
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
        marginBottom: 24,
        marginTop: 16,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16,
        // borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 8,
    },
    sectionContent: {
        gap: 12,
    },
    detailItem: {
        marginBottom: 16,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    toggle: {
        width: 48,
        height: 28,
        borderRadius: 14,
        padding: 4,
        justifyContent: 'center',
    },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
});
