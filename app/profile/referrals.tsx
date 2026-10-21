import Avatar from '@/components/ui/Avatar';
import FeatureUnavailable from '@/components/features/FeatureUnavailable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { useApplyReferralCodeMutation, useGetReferralInfoQuery, useGetReferralsListQuery } from '@/store/api/referralApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPendingReferralCode } from '@/store/slices/authSlice';
import {
    ArrowLeft01Icon,
    CopyIcon,
    GiftIcon,
    Share01Icon,
    UserAdd01Icon,
    UserGroup02Icon,
    Wallet01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { format } from 'date-fns';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { moderateScale } from '@/utils/scaling';

export default function ReferralsScreen() {
    const { colors, spacing } = useTheme();
    const { enabled: referralsEnabled } = useFeatureFlag('referrals');
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const dispatch = useAppDispatch();
    const { pendingReferralCode } = useAppSelector((state) => state.auth);
    const [referralCodeInput, setReferralCodeInput] = useState(pendingReferralCode || '');
    const { data: info, refetch: refetchInfo, isFetching: isFetchingInfo } = useGetReferralInfoQuery(undefined, { skip: !referralsEnabled });
    const { data: referrals, isLoading: isLoadingList, refetch: refetchList, isFetching: isFetchingList } = useGetReferralsListQuery(undefined, { skip: !referralsEnabled });
    const [applyCode, { isLoading: isApplying }] = useApplyReferralCodeMutation();

    useEffect(() => {
        if (pendingReferralCode && !referralCodeInput) setReferralCodeInput(pendingReferralCode);
    }, [pendingReferralCode, referralCodeInput]);

    const handleCopy = async () => {
        if (!info?.referralCode) return;
        await Clipboard.setStringAsync(info.referralCode);
        toast.success('Pass code copied');
    };

    const handleShare = async () => {
        if (!info?.referralCode) return;
        try {
            await Share.share({
                message: `Hey! Join me on GiftSync and get 5 free coins using my code: ${info.referralCode}. Download here: https://giftsync.app/refer/${info.referralCode}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleApply = async () => {
        if (!referralCodeInput.trim()) {
            toast.error('Enter a referral code first');
            return;
        }
        try {
            await applyCode({ code: referralCodeInput.trim() }).unwrap();
            dispatch(setPendingReferralCode(null));
            toast.success('Welcome bonus unlocked!');
        } catch (error: any) {
            toast.error('Could not apply code', { description: error?.data?.message || 'Please check the code and try again.' });
        }
    };

    const onRefresh = () => {
        refetchInfo();
        refetchList();
    };

    const totalCoinsEarned = referrals?.reduce((total, item) => total + item.bonusEarned, 0) || 0;
    const paperColors = [colors.mint, colors.peach, colors.lilac, colors.lemon];

    if (!referralsEnabled) return <FeatureUnavailable title="Referrals are unavailable" />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingTop: insets.top + moderateScale(10), paddingBottom: Math.max(insets.bottom, moderateScale(20)) + moderateScale(30) }}
                    refreshControl={<RefreshControl refreshing={isFetchingInfo || isFetchingList} onRefresh={onRefresh} tintColor={colors.primary} />}
                >
                    <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
                        <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={ArrowLeft01Icon} size={moderateScale(22)} color={colors.ink} />
                        </Pressable>
                        <View style={{ flex: 1 }}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>INVITE · DELIGHT · EARN</Typography>
                            <Typography variant="h1">The gift club</Typography>
                        </View>
                    </View>

                    <View style={[styles.pass, { marginHorizontal: spacing.xl, backgroundColor: colors.lilac, borderColor: colors.ink }]}>
                        <View style={[styles.passNotch, styles.leftNotch, { backgroundColor: colors.background, borderColor: colors.ink }]} />
                        <View style={[styles.passNotch, styles.rightNotch, { backgroundColor: colors.background, borderColor: colors.ink }]} />
                        <View style={styles.passTop}>
                            <View style={[styles.clubMark, { backgroundColor: colors.accent, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={GiftIcon} size={moderateScale(24)} color="#17151D" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Typography variant="caption" style={styles.overline}>GIFTSYNC GIFT CLUB</Typography>
                                <Typography variant="h3">Bring your people in.</Typography>
                            </View>
                            <Typography variant="h3">№{String(info?.referralCount || 0).padStart(2, '0')}</Typography>
                        </View>
                        <View style={[styles.tearLine, { borderColor: colors.ink }]} />
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>YOUR SHAREABLE PASS</Typography>
                        <Pressable onPress={handleCopy} style={[styles.codeBox, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <Typography variant="h1" style={styles.code}>{info?.referralCode || '------'}</Typography>
                            <View style={[styles.copyButton, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={CopyIcon} size={moderateScale(20)} color={colors.ink} />
                            </View>
                        </Pressable>
                        <Button title="Send an invite" onPress={handleShare} leftIcon={<HugeiconsIcon icon={Share01Icon} size={moderateScale(19)} color="#17151D" />} />
                    </View>

                    <View style={[styles.stickerRow, { paddingHorizontal: spacing.xl }]}>
                        <View style={[styles.statSticker, { backgroundColor: colors.lemon, borderColor: colors.ink, transform: [{ rotate: '-3deg' }] }]}>
                            <HugeiconsIcon icon={Wallet01Icon} size={moderateScale(22)} color={colors.ink} />
                            <Typography variant="h1">{totalCoinsEarned}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>COINS EARNED</Typography>
                        </View>
                        <View style={[styles.statSticker, { backgroundColor: colors.mint, borderColor: colors.ink, transform: [{ rotate: '3deg' }] }]}>
                            <HugeiconsIcon icon={UserGroup02Icon} size={moderateScale(22)} color={colors.ink} />
                            <Typography variant="h1">{info?.referralCount || 0}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>FRIENDS JOINED</Typography>
                        </View>
                    </View>

                    <View style={{ paddingHorizontal: spacing.xl, marginTop: moderateScale(34) }}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE THREE-STAMP ROUTE</Typography>
                        <Typography variant="h2">Pass on the good stuff</Typography>
                        <View style={styles.stepsRow}>
                            <StepStamp number="01" icon={Share01Icon} title="Share" description="Send your pass" color={colors.peach} />
                            <StepStamp number="02" icon={UserAdd01Icon} title="Join" description="A friend signs up" color={colors.lilac} />
                            <StepStamp number="03" icon={Wallet01Icon} title="Earn" description="You both get coins" color={colors.mint} />
                        </View>
                    </View>

                    {info && !info.referredBy && (
                        <View style={[styles.secretPass, { marginHorizontal: spacing.xl, backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                            <View style={styles.secretHeading}>
                                <View style={[styles.secretIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                    <HugeiconsIcon icon={UserAdd01Icon} size={moderateScale(22)} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Typography variant="h4">Someone invited you?</Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>Enter their pass and unlock your welcome coins.</Typography>
                                </View>
                            </View>
                            <Input placeholder="Enter their gift-club code" value={referralCodeInput} onChangeText={setReferralCodeInput} autoCapitalize="characters" />
                            <Button title="Unlock my bonus" onPress={handleApply} isLoading={isApplying} />
                        </View>
                    )}

                    <View style={{ paddingHorizontal: spacing.xl, marginTop: moderateScale(34) }}>
                        <View style={styles.friendsHeading}>
                            <View>
                                <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>YOUR CLUB TABLE</Typography>
                                <Typography variant="h2">Friends who joined</Typography>
                            </View>
                            {!!referrals?.length && <View style={[styles.countBadge, { backgroundColor: colors.ink }]}><Typography variant="caption" color={colors.surface}>{referrals.length}</Typography></View>}
                        </View>
                        {isLoadingList ? (
                            <ActivityIndicator color={colors.primary} style={{ margin: moderateScale(28) }} />
                        ) : referrals?.length ? (
                            <View style={styles.friendList}>
                                {referrals.map((item, index) => (
                                    <View key={item.id} style={[styles.friendCard, { backgroundColor: paperColors[index % paperColors.length], borderColor: colors.ink }]}>
                                        <Avatar name={item.name} uri={item.avatarUrl} size={moderateScale(48)} style={{ borderWidth: 1.5, borderColor: colors.ink }} />
                                        <View style={{ flex: 1 }}>
                                            <Typography variant="bodyBold">{item.name}</Typography>
                                            <Typography variant="caption" color={colors.textSecondary}>Joined {format(new Date(item.createdAt), 'MMM d, yyyy')}</Typography>
                                        </View>
                                        <View style={[styles.coinBadge, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                            <Typography variant="caption" style={styles.overline}>+{item.bonusEarned}</Typography>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={[styles.emptyTable, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={UserGroup02Icon} size={moderateScale(34)} color={colors.primary} />
                                <Typography variant="h4">Your table has open seats.</Typography>
                                <Typography variant="body" color={colors.textSecondary} align="center">Share your pass to welcome the first friend.</Typography>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

function StepStamp({ number, icon, title, description, color }: { number: string; icon: any; title: string; description: string; color: string }) {
    const { colors } = useTheme();
    return (
        <View style={[styles.stepStamp, { backgroundColor: color, borderColor: colors.ink }]}>
            <Typography variant="caption" style={styles.overline}>{number}</Typography>
            <View style={[styles.stepIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                <HugeiconsIcon icon={icon} size={moderateScale(20)} color={colors.ink} />
            </View>
            <Typography variant="bodyBold">{title}</Typography>
            <Typography variant="caption" color={colors.textSecondary}>{description}</Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
    backButton: { width: moderateScale(44), height: moderateScale(44), borderWidth: 1.5, borderRadius: moderateScale(14), alignItems: 'center', justifyContent: 'center' },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(0.8) },
    pass: { marginTop: moderateScale(22), borderWidth: 1.5, borderRadius: moderateScale(26), padding: moderateScale(20), gap: moderateScale(14), },
    passNotch: { position: 'absolute', width: moderateScale(22), height: moderateScale(22), borderRadius: moderateScale(11), borderWidth: 1.5, top: moderateScale(99) },
    leftNotch: { left: moderateScale(-12) },
    rightNotch: { right: moderateScale(-12) },
    passTop: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
    clubMark: { width: moderateScale(50), height: moderateScale(50), borderWidth: 1.5, borderRadius: moderateScale(16), alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
    tearLine: { borderTopWidth: 1.5, borderStyle: 'dashed', marginHorizontal: moderateScale(-4) },
    codeBox: { minHeight: moderateScale(72), borderWidth: 1.5, borderRadius: moderateScale(17), borderStyle: 'dashed', paddingHorizontal: moderateScale(16), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    code: { letterSpacing: moderateScale(4) },
    copyButton: { width: moderateScale(40), height: moderateScale(40), borderWidth: 1.25, borderRadius: moderateScale(12), alignItems: 'center', justifyContent: 'center' },
    stickerRow: { flexDirection: 'row', gap: moderateScale(16), marginTop: moderateScale(28) },
    statSticker: { flex: 1, minHeight: moderateScale(138), borderWidth: 1.5, borderRadius: moderateScale(20), padding: moderateScale(15), justifyContent: 'center', alignItems: 'center', },
    stepsRow: { flexDirection: 'row', gap: moderateScale(9), marginTop: moderateScale(15) },
    stepStamp: { flex: 1, minHeight: moderateScale(154), borderWidth: 1.5, borderRadius: moderateScale(17), padding: moderateScale(11), gap: moderateScale(4) },
    stepIcon: { width: moderateScale(38), height: moderateScale(38), borderWidth: 1.25, borderRadius: moderateScale(12), alignItems: 'center', justifyContent: 'center', marginVertical: moderateScale(4) },
    secretPass: { marginTop: moderateScale(32), borderWidth: 1.5, borderRadius: moderateScale(22), padding: moderateScale(16), gap: moderateScale(13), },
    secretHeading: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(11) },
    secretIcon: { width: moderateScale(46), height: moderateScale(46), borderWidth: 1.25, borderRadius: moderateScale(14), alignItems: 'center', justifyContent: 'center' },
    friendsHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: moderateScale(14) },
    countBadge: { minWidth: moderateScale(30), height: moderateScale(30), borderRadius: moderateScale(10), alignItems: 'center', justifyContent: 'center' },
    friendList: { gap: moderateScale(10) },
    friendCard: { minHeight: moderateScale(74), borderWidth: 1.5, borderRadius: moderateScale(18), padding: moderateScale(11), flexDirection: 'row', alignItems: 'center', gap: moderateScale(11) },
    coinBadge: { borderWidth: 1.25, borderRadius: moderateScale(10), paddingHorizontal: moderateScale(9), paddingVertical: moderateScale(6) },
    emptyTable: { borderWidth: 1.5, borderRadius: moderateScale(22), padding: moderateScale(28), alignItems: 'center', gap: moderateScale(7) },
});
