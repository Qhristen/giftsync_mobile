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
import { useLogoutMutation } from '@/store/api/authApi';
import { useDeleteAccountMutation } from '@/store/api/userApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowRight01Icon,
    Building01Icon,
    Delete02Icon,
    FileValidationIcon,
    GiftIcon,
    HelpCircleIcon,
    InformationCircleIcon,
    Location01Icon,
    Moon01Icon,
    PackageIcon,
    ShieldKeyIcon,
    UserEdit01Icon
} from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SettingItem {
    label: string;
    icon: any;
    onPress: () => void;
    extra?: string;
}

interface SettingSection {
    title: string;
    items: SettingItem[];
}

export default function ProfileScreen() {
    const router = useRouter();
    const { colors, spacing, scheme } = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state: RootState) => state.auth.user);
    const [logoutTrigger, { isLoading: isLoggingOut }] = useLogoutMutation();
    const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
    const [currency, setCurrency] = useState('USD ($)');

    const addressSheet = useBottomSheet();
    const themeSheet = useBottomSheet();
    const currencySheet = useBottomSheet();
    const logoutSheet = useBottomSheet();
    const deleteUserSheet = useBottomSheet();

    const sections: SettingSection[] = [
        {
            title: 'Account',
            items: [
                { label: 'Edit Profile', icon: UserEdit01Icon, onPress: () => router.push('/profile/edit') },
                { label: 'Refer & Earn', icon: GiftIcon, onPress: () => router.push('/profile/referrals') },
                { label: 'Saved Addresses', icon: Location01Icon, onPress: () => addressSheet.open() },
            ],
        },
        // {
        //     title: 'Preferences',
        //     items: [
        //         { label: 'Appearance', icon: Moon01Icon, onPress: () => themeSheet.open(), extra: scheme },
        //     ],
        // },
        // {
        //     title: 'Vendors point',
        //     items: [
        //         { label: 'Business Info', icon: Building01Icon, onPress: () => router.push('/profile/business-info') },
        //         ...(user?.business ? [{ label: 'My Products', icon: PackageIcon, onPress: () => router.push('/profile/my-products') }] : []),
        //         ...(user?.business ? [{ label: 'Seller Guide', icon: InformationCircleIcon, onPress: () => router.push('/profile/seller-guide') }] : []),
        //         ...(user?.business ? [{ label: 'Seller FAQs', icon: HelpCircleIcon, onPress: () => router.push('/profile/seller-faqs') }] : []),
        //     ],
        // },
        {
            title: 'Support',
            items: [
                { label: 'GiftSync Help', icon: HelpCircleIcon, onPress: () => router.push('/profile/help') },
                { label: 'Terms & Conditions', icon: FileValidationIcon, onPress: () => router.push('/profile/terms') },
                { label: 'Privacy Policy', icon: ShieldKeyIcon, onPress: () => router.push('/profile/privacy') },
            ],
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>MY GIFTSYNC</Typography>
                    <Typography variant="h1">Your corner</Typography>
                </View>
                {/* Profile Hero */}
                <View style={[styles.hero, { padding: spacing.lg, marginHorizontal: spacing.xl, backgroundColor: colors.lilac, borderColor: colors.ink, shadowColor: colors.ink }]}>
                    <View style={[styles.heroTape, { backgroundColor: colors.lemon, borderColor: colors.ink }]} />
                    <Avatar name={user?.name || 'User'} uri={user?.avatarUrl} size={78} style={{ borderWidth: 1.5, borderColor: colors.ink }} />
                    <View style={{ flex: 1 }}>
                        <Typography variant="h2">{user?.name || 'Guest'}</Typography>
                        <Typography variant="body" color={colors.textSecondary} numberOfLines={1}>{user?.email || ''}</Typography>
                        <Pressable onPress={() => router.push('/profile/edit')} style={[styles.editPill, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <Typography variant="caption" style={{ fontFamily: 'DMSans_700Bold' }}>Edit profile</Typography>
                        </Pressable>
                    </View>
                </View>

                {/* Coin Wallet Card */}
                <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
                    <Card variant="elevated" style={[styles.upgradeCard, { backgroundColor: colors.lemon, borderColor: colors.ink, shadowColor: colors.ink }]}>
                        <View style={{ flex: 1 }}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>YOUR BALANCE</Typography>
                            <Typography variant="h3">Coin Wallet</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Use coins to pay for services.</Typography>
                        </View>
                        <View style={[styles.walletAction, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                            <Button title="Open vault" variant="ghost" size="sm" onPress={() => router.push('/wallet')} />
                        </View>
                    </Card>
                </View>

                {/* Settings Sections */}
                {sections.map((sec, sIdx) => (
                    <View key={sIdx} style={{ marginBottom: spacing.xl }}>
                        <Typography variant="caption" color={colors.textSecondary} style={[styles.overline, { paddingHorizontal: spacing.xl, marginBottom: spacing.sm }]}>
                            {sec.title.toUpperCase()}
                        </Typography>
                        <Card style={[styles.sectionCard, { marginHorizontal: spacing.xl, padding: 0, backgroundColor: colors.surface, borderColor: colors.ink, shadowColor: [colors.mint, colors.peach, colors.lilac, colors.lemon][sIdx % 4], transform: [{ rotate: sIdx % 2 ? '0.4deg' : '-0.4deg' }] }]}>
                            {sec.items.map((item, iIdx) => (
                                <Pressable
                                    key={iIdx}
                                    onPress={item.onPress}
                                    style={({ pressed }) => [
                                        styles.settingItem,
                                        { backgroundColor: pressed ? colors.surfaceRaised : 'transparent' },
                                        iIdx < sec.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.textMuted, borderStyle: 'dashed' },
                                    ]}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: [colors.mint, colors.peach, colors.lilac][iIdx % 3], borderColor: colors.ink }]}>
                                        <HugeiconsIcon icon={item.icon} size={20} color={colors.ink} />
                                    </View>
                                    <Typography variant="body" style={{ flex: 1 }}>{item.label}</Typography>
                                    {item?.extra && (
                                        <Typography variant="caption" color={colors.textSecondary} style={{ marginRight: 8 }}>
                                            {item?.extra}
                                        </Typography>
                                    )}
                                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} color={colors.textMuted} />
                                </Pressable>
                            ))}
                        </Card>
                    </View>
                ))}

                {/* Session and Danger Zone */}
                <View style={[styles.accountActions, { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl }]}>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>SESSION</Typography>
                    <Button
                        title="Sign Out"
                        variant="outline"
                        onPress={() => logoutSheet.open()}
                        style={{ borderColor: colors.border }}
                        color={colors.textPrimary}
                    />

                    <View style={[styles.dangerCard, { backgroundColor: colors.peach, borderColor: colors.ink, shadowColor: colors.ink }]}>
                        <View style={styles.dangerHeading}>
                            <View style={[styles.dangerIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={Delete02Icon} size={24} color={colors.error} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Typography variant="caption" color={colors.error} style={styles.overline}>DANGER ZONE</Typography>
                                <Typography variant="h3">Close your account</Typography>
                            </View>
                        </View>
                        <Typography variant="body" color={colors.textSecondary}>
                            Permanently remove your profile and associated gifting data. This cannot be undone.
                        </Typography>
                        <Button
                            title="Delete my account"
                            variant="destructive"
                            onPress={() => requestAnimationFrame(() => deleteUserSheet.open())}
                            leftIcon={<HugeiconsIcon icon={Delete02Icon} size={19} color="#FFFFFF" />}
                            style={styles.deleteButton}
                        />
                    </View>
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
                isLoading={isLoggingOut}
                onConfirm={async () => {
                    try {
                        await logoutTrigger().unwrap();
                    } catch (error: any) {
                        console.log(error, "error logging out");
                        // Force local cleanup even if the API/Google signout failed
                        dispatch(logout());
                    } finally {
                        logoutSheet.close();
                    }
                }}
            />

            <ConfirmDeleteSheet
                ref={deleteUserSheet.ref}
                title="Delete your account?"
                description="Your profile and associated gifting data will be permanently removed. You will not be able to recover this account."
                confirmLabel="Delete forever"
                isLoading={isDeleting}
                onConfirm={async () => {
                    try {
                        await deleteAccount().unwrap();
                        deleteUserSheet.close();
                        toast.success('Account deleted', { description: 'Your account has been deleted.' });
                        await logoutTrigger().unwrap();
                    } catch (error: any) {
                        toast.error('Error', { description: error?.data?.message || 'Failed to delete account' });
                    }
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    hero: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        borderWidth: 1.5,
        borderRadius: 24,
        shadowOffset: { width: 5, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 5,
        marginBottom: 20,
    },
    heroTape: { position: 'absolute', top: -9, right: 38, width: 60, height: 18, borderWidth: 1, transform: [{ rotate: '4deg' }] },
    upgradeCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1.5,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 0,
        transform: [{ rotate: '0.5deg' }],
    },
    walletAction: { borderWidth: 1.25, borderRadius: 14, overflow: 'hidden' },
    sectionCard: { borderWidth: 1.5, borderRadius: 22, overflow: 'hidden', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0 },
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
        borderWidth: 1,
    },
    editPill: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginTop: 8,
    },
    accountActions: { gap: 12 },
    dangerCard: {
        marginTop: 10,
        borderWidth: 1.5,
        borderRadius: 22,
        padding: 16,
        gap: 13,
        shadowOffset: { width: 4, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
        transform: [{ rotate: '-0.35deg' }],
    },
    dangerHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dangerIcon: { width: 48, height: 48, borderWidth: 1.5, borderRadius: 15, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '4deg' }] },
    deleteButton: { width: '100%', borderColor: '#17151D' },
    overline: {
        fontFamily: 'DMSans_700Bold',
        letterSpacing: 0.9,
    },
});
