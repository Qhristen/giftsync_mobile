import CurrencyPickerSheet from '@/components/sheets/CurrencyPickerSheet';
import ThemePickerSheet from '@/components/sheets/ThemePickerSheet';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useUploadMutation } from '@/store/api/uploadApi';
import { useGetProfileQuery, useUpdateProfileMutation } from '@/store/api/userApi';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { toast } from 'sonner-native';

export default function EditProfileScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const { data: userProfile, isLoading: isFetchingProfile } = useGetProfileQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
    const [uploadImage, { isLoading: isUploadingImage }] = useUploadMutation();
    const currencySheet = useBottomSheet();
    const themeSheet = useBottomSheet();

    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [country, setCountry] = useState('');
    const [currency, setCurrency] = useState('NGN');
    const [theme, setTheme] = useState('system');

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name || '');
            setAvatarUrl(userProfile.avatarUrl || '');
            setCountry(userProfile.country || '');
            setCurrency(userProfile.currency || 'NGN');
            setTheme(userProfile.theme || 'system');
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
        } catch (error: any) {
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.surface }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h3">Edit Profile</Typography>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarSection}>
                    <View>
                        <View style={{ opacity: isUploadingImage ? 0.5 : 1 }}>
                            <Avatar name={name} uri={avatarUrl} size={120} />
                        </View>
                        <Pressable
                            style={[styles.cameraBtn, { backgroundColor: colors.primary }]}
                            onPress={handlePickImage}
                            disabled={isUploadingImage}
                        >
                            <Ionicons name="camera" size={20} color="#FFF" />
                        </Pressable>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ gap: spacing.lg }}>
                    <Input
                        label="Full Name"
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                        leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
                    />

                    <Input
                        label="Country"
                        placeholder="Enter your country"
                        value={country}
                        onChangeText={setCountry}
                        leftIcon={<Ionicons name="globe-outline" size={20} color={colors.textMuted} />}
                    />

                    <Pressable onPress={() => currencySheet.open()}>
                        <View pointerEvents="none">
                            <Input
                                label="Currency"
                                placeholder="Select currency"
                                value={currency}
                                leftIcon={<Ionicons name="cash-outline" size={20} color={colors.textMuted} />}
                                rightIcon={<Ionicons name="chevron-down" size={20} color={colors.textMuted} />}
                                editable={false}
                            />
                        </View>
                    </Pressable>

                    <Pressable onPress={() => themeSheet.open()}>
                        <View pointerEvents="none">
                            <Input
                                label="App Theme"
                                placeholder="Select theme"
                                value={theme.charAt(0).toUpperCase() + theme.slice(1)}
                                leftIcon={<Ionicons name="color-palette-outline" size={20} color={colors.textMuted} />}
                                rightIcon={<Ionicons name="chevron-down" size={20} color={colors.textMuted} />}
                                editable={false}
                            />
                        </View>
                    </Pressable>
                </Animated.View>
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

            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <Button
                    title="Save Changes"
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
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    avatarSection: {
        alignItems: 'center',
        marginVertical: 32,
    },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 24,
        // borderTopWidth: 1,
    },
});
