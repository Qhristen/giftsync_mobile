import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGoogleAuthMutation } from '@/store/api/authApi';
import { GOOGLE_CLIENT_ID } from '@/utils/constants';
import { Calendar01Icon, FavouriteIcon, GiftIcon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { moderateScale } from '@/utils/scaling';

export default function WelcomeScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [googleAuth] = useGoogleAuthMutation();
    const [isSigningIn, setIsSigningIn] = React.useState(false);

    useEffect(() => {
        GoogleSignin.configure({ webClientId: GOOGLE_CLIENT_ID, offlineAccess: true });
    }, []);

    const handleGoogleLogin = async () => {
        if (isSigningIn) return;
        setIsSigningIn(true);
        try {
            await GoogleSignin.hasPlayServices();
            try { await GoogleSignin.signOut(); } catch { /* Show the account picker when possible. */ }
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken;

            if (userInfo.type === 'success' && idToken) {
                await googleAuth({ idToken }).unwrap();
                router.replace('/(tabs)');
            } else if (userInfo.type !== 'cancelled') {
                toast.error('Failed to retrieve your Google sign-in token.');
            }
        } catch (error: any) {
            if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
                toast.error(error.message || 'Google sign-in could not be completed.');
            }
        } finally {
            setIsSigningIn(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.orb, styles.orbOne, { backgroundColor: colors.lime, borderColor: colors.ink }]} />
            <View style={[styles.orb, styles.orbTwo, { backgroundColor: colors.lilac, borderColor: colors.ink }]} />

            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: insets.top + moderateScale(16)}]}
                showsVerticalScrollIndicator={false}
            >

                <View style={[styles.invitation, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                    <View style={[styles.inviteTape, { backgroundColor: colors.lilac, borderColor: colors.ink }]} />
                    <View style={styles.inviteTop}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>AN INVITATION TO REMEMBER WELL</Typography>
                        <View style={[styles.postage, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={FavouriteIcon} size={moderateScale(19)} color={colors.ink} />
                        </View>
                    </View>
                    <Typography variant="h1" style={styles.heroTitle}>Remember the people. Nail the gift.</Typography>
                    <Typography variant="body" color={colors.textSecondary} style={styles.heroCopy}>
                        Keep every meaningful date, find the right thing, and send it without the last-minute panic.
                    </Typography>

                    <View style={styles.cardScene}>
                        <View style={[styles.dateCard, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <Typography variant="caption" style={styles.overline}>NEXT UP</Typography>
                            <Typography variant="h2">24</Typography>
                            <Typography variant="caption">APR · SHELLY</Typography>
                        </View>
                        <View style={[styles.giftCard, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={GiftIcon} size={moderateScale(33)} color={colors.ink} />
                            <View>
                                <Typography variant="caption" color={colors.textSecondary}>GIFT FOUND</Typography>
                                <Typography variant="bodyBold">Something very them</Typography>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.bento}>
                    <WelcomeTile icon={Calendar01Icon} title="Dates kept" detail="A quiet memory for every big moment." color={colors.sky} />
                    <WelcomeTile icon={SparklesIcon} title="Ideas found" detail="The shop and concierge work together." color={colors.lavender} />
                    <View style={[styles.wideTile, { backgroundColor: colors.peach, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={FavouriteIcon} size={moderateScale(24)} color={colors.ink} />
                        <View style={{ flex: 1 }}>
                            <Typography variant="bodyBold">Love, delivered</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Plan the note, route, payment, and doorstep in one flow.</Typography>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + moderateScale(16) }]}>
                <Button title="Continue with Google  →" onPress={handleGoogleLogin} isLoading={isSigningIn} size="lg" style={styles.mainButton} />
                <Typography variant="caption" color={colors.textSecondary} align="center">
                    By continuing, you agree to our{' '}
                    <Typography variant="caption" onPress={() => router.push('/profile/terms')} style={styles.legalLink}>Terms</Typography>
                    {' '}and{' '}
                    <Typography variant="caption" onPress={() => router.push('/profile/privacy')} style={styles.legalLink}>Privacy Policy</Typography>.
                </Typography>
            </View>
        </View>
    );
}

function WelcomeTile({ icon, title, detail, color }: { icon: any; title: string; detail: string; color: string }) {
    const { colors } = useTheme();
    return (
        <View style={[styles.tile, { backgroundColor: color, borderColor: colors.ink }]}>
            <View style={[styles.tileIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                <HugeiconsIcon icon={icon} size={moderateScale(22)} color={colors.ink} />
            </View>
            <Typography variant="bodyBold">{title}</Typography>
            <Typography variant="caption" color={colors.textSecondary}>{detail}</Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: moderateScale(20), gap: moderateScale(22) },
    orb: { position: 'absolute', borderWidth: 1.5, opacity: 0.8 },
    orbOne: { width: moderateScale(130), height: moderateScale(130), borderRadius: moderateScale(65), top: moderateScale(-54), right: moderateScale(-42) },
    orbTwo: { width: moderateScale(82), height: moderateScale(82), borderRadius: moderateScale(28), bottom: moderateScale(130), left: moderateScale(-38), transform: [{ rotate: '22deg' }] },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(11) },
    brandMark: { width: moderateScale(48), height: moderateScale(48), borderWidth: 1.5, borderRadius: moderateScale(15), alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(1) },
    invitation: { borderWidth: 1.5, borderRadius: moderateScale(28), padding: moderateScale(21), gap: moderateScale(10), transform: [{ rotate: '-0.5deg' }] },
    inviteTape: { position: 'absolute', top: moderateScale(-10), left: '42%', width: moderateScale(68), height: moderateScale(21), borderWidth: 1, transform: [{ rotate: '3deg' }] },
    inviteTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: moderateScale(10) },
    postage: { width: moderateScale(42), height: moderateScale(42), borderWidth: 1.5, borderRadius: moderateScale(8), alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', transform: [{ rotate: '4deg' }] },
    heroTitle: { fontSize: moderateScale(40), lineHeight: moderateScale(44), marginTop: moderateScale(5) },
    heroCopy: { maxWidth: moderateScale(330) },
    cardScene: { minHeight: moderateScale(142), marginTop: moderateScale(15) },
    dateCard: { position: 'absolute', left: moderateScale(4), top: moderateScale(7), width: moderateScale(132), height: moderateScale(126), borderWidth: 1.5, borderRadius: moderateScale(17), padding: moderateScale(14), transform: [{ rotate: '-5deg' }] },
    giftCard: { position: 'absolute', right: moderateScale(0), top: moderateScale(27), width: moderateScale(205), minHeight: moderateScale(104), borderWidth: 1.5, borderRadius: moderateScale(18), padding: moderateScale(14), flexDirection: 'row', alignItems: 'center', gap: moderateScale(10), transform: [{ rotate: '3deg' }] },
    bento: { flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(12) },
    tile: { width: '48.2%', borderWidth: 1.5, borderRadius: moderateScale(21), padding: moderateScale(14), gap: moderateScale(6) },
    tileIcon: { width: moderateScale(42), height: moderateScale(42), borderWidth: 1.25, borderRadius: moderateScale(13), alignItems: 'center', justifyContent: 'center', marginBottom: moderateScale(4) },
    wideTile: { width: '100%', borderWidth: 1.5, borderRadius: moderateScale(20), padding: moderateScale(14), flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
    footer: { position: 'absolute', left: moderateScale(0), right: moderateScale(0), bottom: moderateScale(0), paddingHorizontal: moderateScale(20), paddingTop: moderateScale(14), gap: moderateScale(12) },
    mainButton: { width: '100%', minHeight: moderateScale(58) },
    legalLink: { fontWeight: '800', textDecorationLine: 'underline' },
});
