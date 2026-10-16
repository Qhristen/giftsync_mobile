import CurrencyPickerSheet from '@/components/sheets/CurrencyPickerSheet';
import ThemePickerSheet from '@/components/sheets/ThemePickerSheet';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PaperScreenHeader from '@/components/ui/PaperScreenHeader';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useUploadMutation } from '@/store/api/uploadApi';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/store/api/userApi';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    Camera01Icon,
    UserIcon,
    GlobeIcon,
    Money01Icon,
    ArrowDown01Icon,
    PaintBoardIcon
} from '@hugeicons/core-free-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function EditProfileScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const { data: userProfile, isLoading: isFetchingProfile } = useGetProfileQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [uploadImage, { isLoading: isUploadingImage }] = useUploadMutation();
    const currencySheet = useBottomSheet();
    const themeSheet = useBottomSheet();
    const insets = useSafeAreaInsets();

    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [country, setCountry] = useState('');
    const [currency, setCurrency] = useState('NGN');
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setAvatarUrl(userProfile.avatarUrl || '');
            setCountry(userProfile.country || '');
            setCurrency(userProfile.currency || 'NGN');
            setTheme(userProfile.theme || 'light');
        }
    }, [userProfile]);

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                base64: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uri = result.assets[0].uri;
                toast.loading('Uploading avatar...', { id: 'avatar-upload' });
                const uploadedUrl = await uploadImage(uri).unwrap();
                setAvatarUrl(uploadedUrl);
                toast.success('Avatar updated successfully', { id: 'avatar-upload' });
            }
        } catch {
            toast.error('Failed to upload image', { id: 'avatar-upload' });
        }
    };

    const handleSave = async () => {
        try {
            await updateProfile({ name, avatarUrl, country, currency, theme }).unwrap();
            toast.success('Success', { description: 'Profile updated successfully' });
            router.back();
        } catch (error: any) {
            toast.error('Error', { description: error?.data?.message || 'Failed to update profile' });
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
            <PaperScreenHeader eyebrow="Identity card" title="Make it feel like you" onBack={() => router.back()} accent={colors.peach} />

            <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View style={[styles.avatarSection, { backgroundColor: colors.lavender, borderColor: colors.ink }]}>
                    <View style={[styles.photoTape, { backgroundColor: colors.lemon, borderColor: colors.ink }]} />
                    <View>
                        <View style={{ opacity: isUploadingImage ? 0.5 : 1 }}>
                            <Avatar name={name} uri={avatarUrl} size={112} style={{ borderWidth: 1.5, borderColor: colors.ink }} />
                        </View>
                        <Pressable
                            style={[styles.cameraBtn, { backgroundColor: colors.lime, borderColor: colors.ink }]}
                            onPress={handlePickImage}
                            disabled={isUploadingImage}
                        >
                            <HugeiconsIcon icon={Camera01Icon} size={20} color={colors.ink} />
                        </Pressable>
                    </View>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>PROFILE PORTRAIT</Typography>
                    <Typography variant="h3">{name || 'Your name goes here'}</Typography>
                </View>

                <View style={[styles.formPaper, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                    <View style={styles.formHeading}>
                        <Typography variant="label">Personal details</Typography>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>EDITABLE</Typography>
                    </View>
                    <Input
                        label="Full Name"
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                        leftIcon={<HugeiconsIcon icon={UserIcon} size={20} color={colors.textMuted} />}
                    />

                    <Input
                        label="Country"
                        placeholder="Enter your country"
                        value={country}
                        onChangeText={setCountry}
                        leftIcon={<HugeiconsIcon icon={GlobeIcon} size={20} color={colors.textMuted} />}
                    />

                    <Pressable onPress={() => currencySheet.open()}>
                        <View pointerEvents="none">
                            <Input
                                label="Currency"
                                placeholder="Select currency"
                                value={currency}
                                leftIcon={<HugeiconsIcon icon={Money01Icon} size={20} color={colors.textMuted} />}
                                rightIcon={<HugeiconsIcon icon={ArrowDown01Icon} size={20} color={colors.textMuted} />}
                                editable={false}
                            />
                        </View>
                    </Pressable>

                    {/* <Pressable onPress={() => themeSheet.open()}>
                        <View pointerEvents="none">
                            <Input
                                label="App Theme"
                                placeholder="Select theme"
                                value={theme.charAt(0).toUpperCase() + theme.slice(1)}
                                leftIcon={<HugeiconsIcon icon={PaintBoardIcon} size={20} color={colors.textMuted} />}
                                rightIcon={<HugeiconsIcon icon={ArrowDown01Icon} size={20} color={colors.textMuted} />}
                                editable={false}
                            />
                        </View>
                    </Pressable> */}
                </View>
            </ScrollView>

            <CurrencyPickerSheet
                ref={currencySheet.ref}
                currentCurrency={currency}
                onSelect={(val) => {
                    setCurrency(val);
                    currencySheet.close();
                }}
            />

            <ThemePickerSheet
                ref={themeSheet.ref}
                onSelect={(val) => setTheme(val)}
            />

            <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
                <Button
                    title="Stamp my changes  →"
                    variant="primary"
                    onPress={handleSave}
                    isLoading={isUpdating}
                    disabled={isFetchingProfile || isUpdating || isUploadingImage}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    avatarSection: {
        alignItems: 'center',
        padding: 20,
        marginVertical: 12,
        borderWidth: 1.5,
        borderRadius: 25,

        transform: [{ rotate: '-0.6deg' }],
    },
    photoTape: { position: 'absolute', top: -9, width: 64, height: 19, borderWidth: 1, transform: [{ rotate: '4deg' }] },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 1 },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    formPaper: { marginTop: 12, padding: 17, borderWidth: 1.5, borderRadius: 23, gap: 18, },
    formHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 14,
    },
});
