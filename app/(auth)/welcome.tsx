import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGoogleAuthMutation } from '@/store/api/authApi';
import { setOccasions } from '@/store/slices/occasionSlice';
import { fetchGoogleBirthdays } from '@/utils/calendar';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes, } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';

import { GOOGLE_CLIENT_ID } from '@/utils/constants';
import { toast } from 'sonner-native';

const { width, height } = Dimensions.get('window');

GoogleSignin.configure({
    webClientId: GOOGLE_CLIENT_ID,
    offlineAccess: true,

});

export default function WelcomeScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const dispatch = useDispatch();
    const [googleAuth, {error}] = useGoogleAuthMutation();
    const [isSigningIn, setIsSigningIn] = React.useState(false);

    // Animation values
    const logoScale = useSharedValue(0);
    const logoOpacity = useSharedValue(0);

    useEffect(() => {
        logoScale.value = withSpring(1, { damping: 10, stiffness: 120 });
        logoOpacity.value = withTiming(1, { duration: 400 });
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        transform: [{ scale: logoScale.value }],
        opacity: logoOpacity.value,
    }));

    const floatStyle1 = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: withRepeat(
                    withSequence(
                        withTiming(-15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                    ),
                    -1,
                    true
                ),
            },
        ],
    }));

    const floatStyle2 = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: withRepeat(
                    withSequence(
                        withTiming(20, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
                        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) })
                    ),
                    -1,
                    true
                ),
            },
        ],
    }));

    const handleGoogleLogin = async () => {
        if (isSigningIn) return;
        setIsSigningIn(true);
        try {
            await GoogleSignin.hasPlayServices();
            // Using One Tap as requested
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken;
            console.log(idToken, "idToken")

            if (userInfo.type === 'success' && idToken) {
                // Exchange idToken for backend tokens via RTK Query mutation
                await googleAuth({ idToken }).unwrap();

                // Fetch birthdays from Google Calendar (optional)
                const birthdays = await fetchGoogleBirthdays();
                dispatch(setOccasions(birthdays));

                router.replace('/(tabs)');
            } else if (userInfo.type !== 'cancelled') {
                toast.error('Failed to retrieve Google ID Token.');
            }
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                toast.error('Play services not available or outdated.');
            } else {
                console.log('Sign-in error:', error);
                toast.error(error.message || 'An unexpected error occurred during Google Sign-In.');
            }
        } finally {
            setIsSigningIn(false);
        }
    };


    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.primary, colors.accent]}
                start={[0, 0]}
                end={[1, 1]}
                style={StyleSheet.absoluteFill}
            />

            {/* Premium Pattern Layer composed of abstract floating orbs */}
            <Animated.View style={[styles.patternBlob, { top: -height * 0.1, right: -width * 0.2, width: width * 0.8, height: width * 0.8 }, floatStyle1]} />
            <Animated.View style={[styles.patternBlob, { bottom: height * 0.15, left: -width * 0.3, width: width * 0.9, height: width * 0.9 }, floatStyle2]} />

            <View style={styles.content}>
                <Animated.View style={[styles.logoContainer, logoStyle]}>
                    <View style={[styles.logoCircle, { backgroundColor: '#FFFFFF' }]}>
                        <Typography variant="h1" color={colors.primary} style={{ fontSize: 50 }}>🎁</Typography>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                    <Typography variant="h1" align="center" color="#FFFFFF" style={styles.title}>
                        GiftSync
                    </Typography>
                    <Typography variant="body" align="center" color="#FFFFFF" style={styles.tagline}>
                        Your relationships, remembered.
                    </Typography>
                </Animated.View>
            </View>

            <Animated.View entering={FadeInDown.delay(450).duration(400)} style={[styles.footer, { padding: spacing.xl }]}>
                <Button
                    title="Sign In with Google"
                    onPress={handleGoogleLogin}
                    variant="secondary"
                    isLoading={isSigningIn}
                    style={styles.googleBtn}
                    color='#000000'
                    leftIcon={<Ionicons name="logo-google" size={20} color={colors.primary} style={{ marginRight: 8 }} />}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 10,
    },
    title: {
        fontSize: 48,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 18,
        opacity: 0.9,
    },
    footer: {
        width: '100%',
        gap: 12,
    },
    btn: {
        width: '100%',
    },
    patternBlob: {
        position: 'absolute',
        borderRadius: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    googleBtn: {
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',

    },
});
