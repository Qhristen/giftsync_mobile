import Avatar from '@/components/ui/Avatar';
import FeatureUnavailable from '@/components/features/FeatureUnavailable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PaperScreenHeader from '@/components/ui/PaperScreenHeader';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { useCreateBusinessMutation, useGetBusinessQuery, useUpdateBusinessMutation } from '@/store/api/businessApi';
import { useUploadMutation } from '@/store/api/uploadApi';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    CheckmarkCircle01Icon,
    Alert01Icon,
    Building04Icon,
    LegalDocument01Icon,
    Wallet01Icon,
    Search01Icon,
    Tick01Icon,
    ArrowDown01Icon
} from '@hugeicons/core-free-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';
import { useListBanksQuery, useVerifyAccountMutation } from '@/store/api/paymentApi';
import { useGetDefaultPaymentGatewayQuery } from '@/store/api/platformConfigApi';
import BottomSheetWrapper, { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import { moderateScale } from '@/utils/scaling';

export default function BusinessInfoScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const { enabled: businessOnboardingEnabled } = useFeatureFlag('business_onboarding');

    const { data: business, isLoading: isFetching } = useGetBusinessQuery();
    const [createBusiness, { isLoading: isCreating }] = useCreateBusinessMutation();
    const [updateBusiness, { isLoading: isUpdating }] = useUpdateBusinessMutation();
    const [uploadLogo, { isLoading: isUploading }] = useUploadMutation();

    const { data: defaultGateway } = useGetDefaultPaymentGatewayQuery();
    const { data: banks, isLoading: isLoadingBanks } = useListBanksQuery(defaultGateway?.gateway);
    const [verifyAccount, { isLoading: isVerifying }] = useVerifyAccountMutation();

    const bankSheetRef = useRef<BottomSheetRef>(null);
    const [bankSearch, setBankSearch] = useState('');
    const [isAccountVerified, setIsAccountVerified] = useState(false);

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
            if (business.bankAccountNumber && business.bankName) {
                setIsAccountVerified(true);
            }
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
        if (!business && !businessOnboardingEnabled) {
            toast.error('Business onboarding is currently unavailable.');
            return;
        }
        if (!isAccountVerified && !business) {
            toast.error('Please verify your bank account details first');
            return;
        }
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

    const handleVerifyAccount = async (accountNumber?: string, bankName?: string) => {
        console.log(accountNumber, accountNumber?.length, bankName, "accountNumber, bankName")
        const accNo = accountNumber || formData.bankAccountNumber;
        const bName = bankName || formData.bankName;

        if (!accNo || !bName) {
            if (!accountNumber) toast.error('Please select a bank and enter account number');
            return;
        }
        const selectedBank = banks?.find(b => b.name === bName);
        if (!selectedBank) {
            if (!accountNumber) toast.error('Please select a valid bank from the list');
            return;
        }

        try {
            const result = await verifyAccount({
                accountNumber: accNo,
                bankCode: selectedBank.code,
                gateway: defaultGateway?.gateway,
            }).unwrap();
            setFormData(prev => ({ ...prev, bankAccountName: result.accountName }));
            setIsAccountVerified(true);
            toast.success('Account verified successfully');
        } catch (error: any) {
            console.log(error, "verification error");
            toast.error(error?.data?.message || 'Verification failed. Please check your details.');
            setIsAccountVerified(false);
        }
    };

    const filteredBanks = banks?.filter(bank =>
        bank.name.toLowerCase().includes(bankSearch.toLowerCase())
    );

    const InfoSection = ({ title, children, icon }: { title: string, children: React.ReactNode, icon?: any }) => {
        const paperColor = title.includes('Basic') ? colors.mint : title.includes('Legal') ? colors.lemon : colors.lavender;
        return (
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                <View style={styles.sectionHeader}>
                    {icon && <View style={[styles.sectionIcon, { backgroundColor: paperColor, borderColor: colors.ink }]}><HugeiconsIcon icon={icon} size={moderateScale(20)} color={colors.ink} /></View>}
                    <Typography variant="h4" style={{ fontWeight: '700' }}>{title}</Typography>
                </View>
                <View style={styles.sectionContent}>{children}</View>
            </View>
        );
    };

    const DetailItem = ({ label, value, icon }: { label: string, value: string | boolean | undefined, icon?: any }) => (
        <View style={[styles.detailItem, { borderColor: colors.textMuted }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(8), marginBottom: moderateScale(4) }}>
                {icon && <HugeiconsIcon icon={icon} size={moderateScale(14)} color={colors.textSecondary} />}
                <Typography variant="label" color={colors.textSecondary}>{label}</Typography>
            </View>
            <Typography variant="body" style={{ fontWeight: '500' }}>
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || 'Not provided')}
            </Typography>
        </View>
    );

    const showForm = isEditing || !business;

    if (!isFetching && !business && !businessOnboardingEnabled) {
        return <FeatureUnavailable title="Business onboarding is unavailable" />;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
                <PaperScreenHeader
                    eyebrow="Maker storefront"
                    title={business ? (isEditing ? 'Tune the shop card' : 'Your business dossier') : 'Build your maker card'}
                    onBack={() => router.back()}
                    accent={colors.mint}
                    right={business ? (
                        <Pressable onPress={() => setIsEditing(!isEditing)} style={[styles.editButton, { backgroundColor: isEditing ? colors.peach : colors.lime, borderColor: colors.ink }]}>
                            {business && (
                                <Typography variant="caption" style={{ fontWeight: '800' }}>
                                    {isEditing ? 'Cancel' : 'Edit'}
                                </Typography>
                            )}
                        </Pressable>) : undefined}
                />

                {isFetching && (
                    <View style={[styles.loadingOverlay, { backgroundColor: colors.background + '80' }]}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                )}

                <ScrollView contentContainerStyle={{ paddingBottom: moderateScale(120) }} showsVerticalScrollIndicator={false}>
                    {business && (formData.isVerified ? (
                        <View style={[styles.banner, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={moderateScale(20)} color={colors.ink} />
                            <Typography variant="body" style={{ flex: 1, fontWeight: '600' }}>
                                Verified maker · ready for the shop
                            </Typography>
                        </View>
                    ) : (
                        <View style={[styles.banner, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={Alert01Icon} size={moderateScale(20)} color={colors.ink} />
                            <Typography variant="body" style={{ flex: 1 }}>
                                Your business is not verified yet. Get verified to reach more customers.
                            </Typography>
                        </View>
                    ))}

                    <View style={[styles.logoSection, { backgroundColor: colors.lilac, borderColor: colors.ink }]}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>STOREFRONT PORTRAIT</Typography>
                        <Avatar
                            name={formData.name}
                            uri={formData.logoUrl}
                            size={moderateScale(96)}
                            style={{ borderWidth: 1.5, borderColor: colors.ink }}
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
                        <InfoSection title="Basic Information" icon={Building04Icon}>
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

                        <InfoSection title="Legal & Registration" icon={LegalDocument01Icon}>
                            {showForm ? (
                                <>
                                    <View style={[styles.toggleRow, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                                        <Typography variant="body">Is your business registered?</Typography>
                                        <Pressable
                                            onPress={() => setFormData({ ...formData, isRegistered: !formData.isRegistered })}
                                            style={[styles.toggle, { backgroundColor: formData.isRegistered ? colors.primary : colors.surfaceRaised }]}
                                        >
                                            <View style={[styles.toggleThumb, { transform: [{ translateX: formData.isRegistered ? moderateScale(20) : moderateScale(0) }] }]} />
                                        </Pressable>
                                    </View>

                                    {formData.isRegistered && (
                                        <View style={{ gap: moderateScale(16), marginTop: moderateScale(8) }}>
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

                        <InfoSection title="Financial Details" icon={Wallet01Icon}>
                            {showForm ? (
                                <>
                                    <Pressable onPress={() => bankSheetRef.current?.present()}>
                                        <View pointerEvents="none">
                                            <Input
                                                label="Bank Name"
                                                value={formData.bankName}
                                                placeholder="Select your bank"
                                                editable={false}
                                                rightIcon={<HugeiconsIcon icon={ArrowDown01Icon} size={moderateScale(20)} color={colors.textSecondary} />}
                                            />
                                        </View>
                                    </Pressable>

                                    <Input
                                        label="Account Number"
                                        value={formData.bankAccountNumber}
                                        onChangeText={(text) => {
                                            setFormData({ ...formData, bankAccountNumber: text });
                                            setIsAccountVerified(false);
                                            if (text.length === 10) {
                                                handleVerifyAccount(text);
                                            }
                                        }}
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        rightIcon={isVerifying ? <ActivityIndicator size="small" color={colors.primary} /> : null}
                                    />

                                    <Input
                                        label="Account Name"
                                        value={formData.bankAccountName}
                                        onChangeText={(text) => setFormData({ ...formData, bankAccountName: text })}
                                        editable={false}
                                        placeholder="Verified account name will appear here"
                                        style={{ backgroundColor: colors.surfaceRaised + '50' }}
                                    />
                                    {isAccountVerified && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(4), marginTop: moderateScale(-8) }}>
                                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={moderateScale(16)} color={colors.success} />
                                            <Typography variant="label" color={colors.success}>Account verified</Typography>
                                        </View>
                                    )}
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
                                title={business ? "Stamp the updates  →" : "Open my storefront  →"}
                                onPress={handleSave}
                                isLoading={isCreating || isUpdating}
                                disabled={!isAccountVerified && !business}
                                style={{ marginTop: spacing.xl }}
                            />
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <BottomSheetWrapper
                ref={bankSheetRef}
                snapPoints={['80%', '95%']}
                scrollable
                keyboardBehavior="extend"
            >
                <View style={styles.bankSheetContent}>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>PAYOUT DIRECTORY</Typography>
                    <Typography variant="h2" style={{ marginBottom: moderateScale(20) }}>Choose your bank</Typography>
                    <Input
                        placeholder="Search banks..."
                        value={bankSearch}
                        onChangeText={setBankSearch}
                        isBottomSheet={true}
                        leftIcon={<HugeiconsIcon icon={Search01Icon} size={moderateScale(20)} color={colors.textSecondary} />}
                    />

                    {isLoadingBanks ? (
                        <ActivityIndicator style={{ marginTop: moderateScale(20) }} color={colors.primary} />
                    ) : (
                        <View style={{ gap: moderateScale(4), paddingBottom: moderateScale(40) }}>
                            {filteredBanks?.map((bank, i) => (
                                <Pressable
                                    key={i}
                                    style={({ pressed }) => [
                                        styles.bankItem,
                                        {
                                            backgroundColor: pressed ? colors.lavender : colors.surface,
                                            borderColor: colors.ink,
                                        }
                                    ]}
                                    onPress={() => {
                                        setFormData({ ...formData, bankName: bank.name });
                                        setIsAccountVerified(false);
                                        bankSheetRef.current?.dismiss();
                                    }}
                                >
                                    <Typography variant="body">{bank.name}</Typography>
                                    {formData.bankName === bank.name && (
                                        <HugeiconsIcon icon={Tick01Icon} size={moderateScale(20)} color={colors.primary} />
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    )}
                </View>
            </BottomSheetWrapper>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    editButton: {
        minWidth: moderateScale(48),
        height: moderateScale(38),
        paddingHorizontal: moderateScale(10),
        borderWidth: 1.5,
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '3deg' }],
    },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(0.9) },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(12),
        marginBottom: moderateScale(16),
        marginHorizontal: moderateScale(20),
        marginTop: moderateScale(16),
        borderRadius: moderateScale(18),
        borderWidth: 1.5,
        gap: moderateScale(12),
        transform: [{ rotate: '-0.4deg' }],
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: moderateScale(24),
        marginTop: moderateScale(6),
        marginHorizontal: moderateScale(20),
        padding: moderateScale(18),
        borderWidth: 1.5,
        borderRadius: moderateScale(24),
        gap: moderateScale(7),

        transform: [{ rotate: '0.5deg' }],
    },
    section: {
        marginBottom: moderateScale(22),
        padding: moderateScale(17),
        borderWidth: 1.5,
        borderRadius: moderateScale(23),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(10),
        marginBottom: moderateScale(16),
        paddingBottom: moderateScale(8),
    },
    sectionIcon: { width: moderateScale(40), height: moderateScale(40), borderWidth: 1.25, borderRadius: moderateScale(13), alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-3deg' }] },
    sectionContent: {
        gap: moderateScale(12),
    },
    detailItem: {
        paddingVertical: moderateScale(10),
        borderBottomWidth: 1,
        borderStyle: 'dashed',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(16),
        borderRadius: moderateScale(16),
        borderWidth: 1.5,
        marginBottom: moderateScale(8),
    },
    toggle: {
        width: moderateScale(48),
        height: moderateScale(28),
        borderRadius: moderateScale(14),
        padding: moderateScale(4),
        justifyContent: 'center',
    },
    toggleThumb: {
        width: moderateScale(20),
        height: moderateScale(20),
        borderRadius: moderateScale(10),
        backgroundColor: '#FFF',
    },
    loadingOverlay: {
        position: 'absolute',
        top: moderateScale(0),
        left: moderateScale(0),
        right: moderateScale(0),
        bottom: moderateScale(0),
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    bankSheetContent: {
        paddingTop: moderateScale(8),
    },
    bankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: moderateScale(14),
        paddingHorizontal: moderateScale(13),
        borderWidth: 1.25,
        borderRadius: moderateScale(15),
        marginBottom: moderateScale(8),
    },
});
