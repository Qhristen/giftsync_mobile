import AddressPickerSheet from '@/components/sheets/AddressPickerSheet';
import ConfirmDeleteSheet from '@/components/sheets/ConfirmDeleteSheet';
import CurrencyPickerSheet from '@/components/sheets/CurrencyPickerSheet';
import ThemePickerSheet from '@/components/sheets/ThemePickerSheet';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
    const router = useRouter();
    const { colors, spacing, scheme } = useTheme();
    const dispatch = useAppDispatch();
    const themeSheet = useBottomSheet();
    const currencySheet = useBottomSheet();
    const logoutSheet = useBottomSheet();
    const deleteUserSheet = useBottomSheet();
    const addressSheet = useBottomSheet();

    const { user } = useAppSelector((state: RootState) => state.auth);
    const [currency, setCurrency] = useState('NGN');

    const sections = [
        {
            title: 'Account',
            items: [
                { label: 'Edit Profile', icon: 'person-outline', onPress: () => router.push('/profile/edit') },
                { label: 'Saved Addresses', icon: 'location-outline', onPress: () => addressSheet.open() },
            ],
        },
        {
            title: 'Preferences',
            items: [
                { label: 'Appearance', icon: 'moon-outline', onPress: () => themeSheet.open(), extra: scheme },
                { label: 'Notifications', icon: 'notifications-outline', onPress: () => router.push('/notifications') },
                { label: 'Currency', icon: 'cash-outline', onPress: () => currencySheet.open(), extra: currency },
            ],
        },
        {
            title: 'Support',
            items: [
                { label: 'GiftSync Help', icon: 'help-circle-outline', onPress: () => router.push({ pathname: '/profile/legal', params: { type: 'help' } }) },
                { label: 'Terms & Conditions', icon: 'document-text-outline', onPress: () => router.push({ pathname: '/profile/legal', params: { type: 'terms' } }) },
                { label: 'Privacy Policy', icon: 'shield-checkmark-outline', onPress: () => router.push({ pathname: '/profile/legal', params: { type: 'privacy' } }) },
            ],
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Profile Hero */}
                <View style={[styles.hero, { padding: spacing.xl }]}>
                    <Avatar name={user?.name || 'User'} uri={user?.avatarUrl} size={100} />
                    <Typography variant="h2" style={{ marginTop: spacing.md }}>{user?.name || 'Guest'}</Typography>
                    <Typography variant="body" color={colors.textSecondary}>{user?.email || ''}</Typography>
                </View>

                {/* Coin Wallet Card */}
                <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
                    <Card variant="elevated" style={[styles.upgradeCard, { backgroundColor: colors.primary }]}>
                        <View style={{ flex: 1 }}>
                            <Typography variant="h3" color="#FFFFFF">Coin Wallet</Typography>
                            <Typography variant="caption" color="#FFFFFF" style={{ opacity: 0.9 }}>Use coins to pay for services.</Typography>
                        </View>
                        <Button title="Buy Coins" variant="secondary" size="sm" onPress={() => router.push('/wallet')} />
                    </Card>
                </View>

                {/* Settings Sections */}
                {sections.map((sec, sIdx) => (
                    <View key={sIdx} style={{ marginBottom: spacing.xl }}>
                        <Typography variant="label" color={colors.textSecondary} style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.sm }}>
                            {sec.title}
                        </Typography>
                        <Card style={{ marginHorizontal: spacing.xl, padding: 0 }}>
                            {sec.items.map((item, iIdx) => (
                                <Pressable
                                    key={iIdx}
                                    onPress={item.onPress}
                                    style={({ pressed }) => [
                                        styles.settingItem,
                                        { backgroundColor: pressed ? colors.surfaceRaised : 'transparent' },
                                        iIdx < sec.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border + '33' },
                                    ]}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: colors.surfaceRaised }]}>
                                        <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                                    </View>
                                    <Typography variant="body" style={{ flex: 1 }}>{item.label}</Typography>
                                    {item.extra && (
                                        <Typography variant="caption" color={colors.textSecondary} style={{ marginRight: 8 }}>
                                            {item.extra}
                                        </Typography>
                                    )}
                                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                                </Pressable>
                            ))}
                        </Card>
                    </View>
                ))}

                {/* Sign Out and Delete */}
                <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: 12 }}>
                    <Button
                        title="Sign Out"
                        variant="outline"
                        onPress={() => logoutSheet.open()}
                        style={{ borderColor: colors.border }}
                        color={colors.textPrimary}
                    />
                    <Button
                        title="Delete Account"
                        variant="ghost"
                        onPress={() => deleteUserSheet.open()}
                        color={colors.error}
                    />
                </View>
            </ScrollView>

            {/* Sheets */}
            <AddressPickerSheet
                ref={addressSheet.ref}
                onSelect={(addr) => {
                    addressSheet.close();
                    // Optionally set default or just close
                }}
            />
            <ThemePickerSheet ref={themeSheet.ref} />
            <CurrencyPickerSheet
                ref={currencySheet.ref}
                currentCurrency={currency}
                onSelect={(val) => {
                    setCurrency(val);
                    currencySheet.close();
                }}
            />

            <ConfirmDeleteSheet
                ref={logoutSheet.ref}
                title="Sign Out"
                description="Are you sure you want to sign out of GiftSync?"
                confirmLabel="Sign Out"
                onConfirm={async () => {
                    await dispatch(logoutUser());
                    logoutSheet.close();
                    router.replace('/(auth)/welcome');
                }}
            />

            <ConfirmDeleteSheet
                ref={deleteUserSheet.ref}
                title="Delete Account"
                description="Are you sure you want to permanently delete your account and all associated data? This action cannot be undone."
                confirmLabel="Delete Account"
                onConfirm={() => {
                    deleteUserSheet.close();
                    router.replace('/(auth)/welcome');
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    hero: {
        alignItems: 'center',
        paddingBottom: 24,
    },
    upgradeCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
