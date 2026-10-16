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
                contentContainerStyle={[styles.content, { paddingTop: insets.top + 16}]}
                showsVerticalScrollIndicator={false}
            >

                <View style={[styles.invitation, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                    <View style={[styles.inviteTape, { backgroundColor: colors.lilac, borderColor: colors.ink }]} />
                    <View style={styles.inviteTop}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>AN INVITATION TO REMEMBER WELL</Typography>
                        <View style={[styles.postage, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={FavouriteIcon} size={19} color={colors.ink} />
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
                            <HugeiconsIcon icon={GiftIcon} size={33} color={colors.ink} />
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
                        <HugeiconsIcon icon={FavouriteIcon} size={24} color={colors.ink} />
                        <View style={{ flex: 1 }}>
                            <Typography variant="bodyBold">Love, delivered</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Plan the note, route, payment, and doorstep in one flow.</Typography>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
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
                <HugeiconsIcon icon={icon} size={22} color={colors.ink} />
            </View>
            <Typography variant="bodyBold">{title}</Typography>
            <Typography variant="caption" color={colors.textSecondary}>{detail}</Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20, gap: 22 },
    orb: { position: 'absolute', borderWidth: 1.5, opacity: 0.8 },
    orbOne: { width: 130, height: 130, borderRadius: 65, top: -54, right: -42 },
    orbTwo: { width: 82, height: 82, borderRadius: 28, bottom: 130, left: -38, transform: [{ rotate: '22deg' }] },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
    brandMark: { width: 48, height: 48, borderWidth: 1.5, borderRadius: 15, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 1 },
    invitation: { borderWidth: 1.5, borderRadius: 28, padding: 21, gap: 10, transform: [{ rotate: '-0.5deg' }] },
    inviteTape: { position: 'absolute', top: -10, left: '42%', width: 68, height: 21, borderWidth: 1, transform: [{ rotate: '3deg' }] },
    inviteTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    postage: { width: 42, height: 42, borderWidth: 1.5, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', transform: [{ rotate: '4deg' }] },
    heroTitle: { fontSize: 40, lineHeight: 44, marginTop: 5 },
    heroCopy: { maxWidth: 330 },
    cardScene: { minHeight: 142, marginTop: 15 },
    dateCard: { position: 'absolute', left: 4, top: 7, width: 132, height: 126, borderWidth: 1.5, borderRadius: 17, padding: 14, transform: [{ rotate: '-5deg' }] },
    giftCard: { position: 'absolute', right: 0, top: 27, width: 205, minHeight: 104, borderWidth: 1.5, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, transform: [{ rotate: '3deg' }] },
    bento: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    tile: { width: '48.2%', minHeight: 148, borderWidth: 1.5, borderRadius: 21, padding: 14, gap: 6 },
    tileIcon: { width: 42, height: 42, borderWidth: 1.25, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    wideTile: { width: '100%', minHeight: 86, borderWidth: 1.5, borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    footer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 14, gap: 12 },
    mainButton: { width: '100%', minHeight: 58 },
    legalLink: { fontWeight: '800', textDecorationLine: 'underline' },
});
