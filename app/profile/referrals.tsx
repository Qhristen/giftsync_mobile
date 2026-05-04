import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useApplyReferralCodeMutation, useGetReferralInfoQuery, useGetReferralsListQuery } from '@/store/api/referralApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setPendingReferralCode } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

export default function ReferralsScreen() {
    const { colors, spacing, isDark } = useTheme();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { pendingReferralCode } = useAppSelector((state) => state.auth);
 const insets = useSafeAreaInsets();
    const [referralCodeInput, setReferralCodeInput] = useState(pendingReferralCode || '');

    const { data: info, isLoading: isLoadingInfo, refetch: refetchInfo, isFetching: isFetchingInfo } = useGetReferralInfoQuery();
    const { data: referrals, isLoading: isLoadingList, refetch: refetchList, isFetching: isFetchingList } = useGetReferralsListQuery();
    const [applyCode, { isLoading: isApplying }] = useApplyReferralCodeMutation();

    useEffect(() => {
        if (pendingReferralCode && !referralCodeInput) {
            setReferralCodeInput(pendingReferralCode);
        }
    }, [pendingReferralCode]);

    const handleCopy = async () => {
        if (info?.referralCode) {
            await Clipboard.setStringAsync(info.referralCode);
            toast.success('Copied!', { description: 'Referral code copied to clipboard' });
        }
    };

    const handleShare = async () => {
        if (info?.referralCode) {
            try {
                await Share.share({
                    message: `Hey! Join me on GiftSync and get 5 free coins using my code: ${info.referralCode}. Download here: https://giftsync.app/refer/${info.referralCode}`,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        }
    };

    const handleApply = async () => {
        if (!referralCodeInput.trim()) {
            toast.error('Error', { description: 'Please enter a referral code' });
            return;
        }

        try {
            await applyCode({ code: referralCodeInput.trim() }).unwrap();
            toast.success('Success!', { description: 'Referral code applied successfully. Enjoy your bonus!' });
            dispatch(setPendingReferralCode(null));
        } catch (error: any) {
            toast.error('Error', { description: error?.data?.message || 'Failed to apply referral code' });
        }
    };

    const onRefresh = () => {
        refetchInfo();
        refetchList();
    };

    const totalCoinsEarned = referrals?.reduce((acc, item) => acc + item.bonusEarned, 0) || 0;

    const isRefreshing = isFetchingInfo || isFetchingList;

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}>
            {/* Custom Header */}
            <View style={[styles.header, { borderBottomColor: colors.border + '33', paddingTop: insets.top }]}>
                <Button
                    title="Back"
                    variant="ghost"
                    size="sm"
                    onPress={() => router.back()}
                    leftIcon={<Ionicons name="chevron-back" size={24} color={colors.textPrimary} />}
                />
                <Typography variant="h3" style={{ flex: 1, textAlign: 'center', marginRight: 40 }}>Rewards</Typography>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Stats Header Gradient */}
                    <LinearGradient
                        colors={[colors.primary, colors.primary + 'CC']}
                        style={[styles.statsHeader, { padding: spacing.xl }]}
                    >
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Typography variant="h1" color="#FFFFFF">{totalCoinsEarned}</Typography>
                                <Typography variant="caption" color="#FFFFFFCC">Coins Earned</Typography>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: '#FFFFFF33' }]} />
                            <View style={styles.statItem}>
                                <Typography variant="h1" color="#FFFFFF">{info?.referralCount || 0}</Typography>
                                <Typography variant="caption" color="#FFFFFFCC">Friends Joined</Typography>
                            </View>
                        </View>
                    </LinearGradient>

                    <View style={{ padding: spacing.xl }}>
                        {/* How it Works */}
                        <Typography variant="h3" style={{ marginBottom: spacing.lg }}>How it works</Typography>
                        <View style={styles.stepsContainer}>
                            <StepItem
                                icon="share-outline"
                                title="Share Link"
                                description="Send your code to friends"
                                step={1}
                            />
                            <StepItem
                                icon="person-add-outline"
                                title="Friend Joins"
                                description="They sign up with your code"
                                step={2}
                            />
                            <StepItem
                                icon="wallet-outline"
                                title="Both Earn"
                                description="You get 10, they get 5 coins"
                                step={3}
                                isLast
                            />
                        </View>

                        {/* Referral Code Card */}
                        <Card style={[styles.codeCard, { backgroundColor: colors.surface, marginTop: spacing.xl }]}>
                            <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>
                                YOUR REFERRAL CODE
                            </Typography>
                            <View style={[styles.codeBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                <Typography variant="h2" style={styles.codeText}>{info?.referralCode || '------'}</Typography>
                                <Pressable onPress={handleCopy} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                                    <Ionicons name="copy-outline" size={24} color={colors.primary} />
                                </Pressable>
                            </View>
                            <Button
                                title="Invite Friends"
                                onPress={handleShare}
                                style={{ marginTop: spacing.lg }}
                                leftIcon={<Ionicons name="share-social-outline" size={20} color="#FFFFFF" />}
                            />
                        </Card>

                        {/* Apply Code Section */}
                        {info && !info.referredBy && (
                            <View style={{ marginTop: spacing.xl }}>
                                <Card style={{ padding: spacing.lg, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.primary + '66' }}>
                                    <Typography variant="bodyMedium" style={{ marginBottom: spacing.sm }}>Received a code?</Typography>
                                    <View style={styles.applyRow}>
                                        <Input
                                            placeholder="Enter code here"
                                            value={referralCodeInput}
                                            onChangeText={setReferralCodeInput}
                                            style={{ flex: 1 }}
                                        />
                                        <Button
                                            title="Apply"
                                            onPress={handleApply}
                                            isLoading={isApplying}
                                            style={{ marginLeft: spacing.sm, height: 56, borderRadius: 10 }}
                                        />
                                    </View>
                                </Card>
                            </View>
                        )}

                        {/* Referrals List Section */}
                        <View style={{ marginTop: spacing.xl }}>
                            <Typography variant="h3" style={{ marginBottom: spacing.md }}>My Friends</Typography>
                            {isLoadingList ? (
                                <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
                            ) : referrals && referrals.length > 0 ? (
                                referrals.map((item) => (
                                    <View key={item.id} style={[styles.referralItem, { borderBottomColor: colors.border + '33' }]}>
                                        <Avatar name={item.name} uri={item.avatarUrl} size={44} />
                                        <View style={{ flex: 1, marginLeft: spacing.md }}>
                                            <Typography variant="bodyMedium">{item.name}</Typography>
                                            <Typography variant="caption" color={colors.textSecondary}>
                                                {format(new Date(item.createdAt), 'MMM d, yyyy')}
                                            </Typography>
                                        </View>
                                        <View style={[styles.bonusBadge, { backgroundColor: colors.success + '15' }]}>
                                            <Typography variant="caption" color={colors.success} style={{ fontWeight: 'bold' }}>+{item.bonusEarned}</Typography>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View style={styles.emptyState}>
                                    <Ionicons name="people-outline" size={48} color={colors.textMuted} style={{ marginBottom: spacing.sm }} />
                                    <Typography variant="body" color={colors.textMuted}>No friends joined yet</Typography>
                                </View>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

function StepItem({ icon, title, description, step, isLast }: { icon: string, title: string, description: string, step: number, isLast?: boolean }) {
    const { colors, spacing } = useTheme();
    return (
        <View style={styles.stepItem}>
            <View style={styles.stepLeft}>
                <View style={[styles.stepIcon, { backgroundColor: colors.primary + '10' }]}>
                    <Ionicons name={icon as any} size={22} color={colors.primary} />
                </View>
                {!isLast && <View style={[styles.stepLine, { backgroundColor: colors.border }]} />}
            </View>
            <View style={styles.stepRight}>
                <Typography variant="bodyMedium" style={{ fontWeight: 'bold' }}>{title}</Typography>
                <Typography variant="caption" color={colors.textSecondary}>{description}</Typography>
            </View>
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
        // paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    statsHeader: {
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-evenly',
    },
    statItem: {
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 40,
    },
    stepsContainer: {
        gap: 0,
    },
    stepItem: {
        flexDirection: 'row',
        height: 70,
    },
    stepLeft: {
        alignItems: 'center',
        width: 40,
    },
    stepIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    stepLine: {
        width: 2,
        flex: 1,
        marginVertical: -2,
    },
    stepRight: {
        flex: 1,
        marginLeft: 16,
        paddingTop: 4,
    },
    codeCard: {
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
    },
    codeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    codeText: {
        letterSpacing: 3,
        fontWeight: 'bold',
    },
    applyRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    referralItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    bonusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
});
