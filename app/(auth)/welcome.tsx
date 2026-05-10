import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGoogleAuthMutation } from '@/store/api/authApi';
import { setOccasions } from '@/store/slices/occasionSlice';
import { fetchGoogleBirthdays } from '@/utils/calendar';
import { moderateScale } from '@/utils/scaling';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes, } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';

import { useRouter } from 'expo-router';

// Removed Dimensions import as width was unused

import { GOOGLE_CLIENT_ID } from '@/utils/constants';
import { toast } from 'sonner-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BubbleProps {
    size: number;
    color: string;
    icon: any; // Ionicons names
    delay: number;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    iconColor?: string;
}

const Bubble = ({ size, color, icon, delay, top, left, right, bottom, iconColor }: BubbleProps) => {
    const { colors, isDark } = useTheme();
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withDelay(delay, withSpring(1));
        opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
        translateY.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 2000 + delay, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 2000 + delay, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }, { scale: scale.value }],
        opacity: opacity.value,
    }));

    // Determine icon color if not provided
    const resolvedIconColor = iconColor || (
        (color === colors.surface || color === colors.surfaceRaised || color === colors.background)
            ? colors.textPrimary 
            : '#FFFFFF'
    );

    return (
        <Animated.View
            style={[
                styles.bubble,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: color,
                    top, left, right, bottom
                },
                animatedStyle
            ]}
        >
            <Ionicons name={icon} size={size * 0.5} color={resolvedIconColor} />
        </Animated.View>
    );
};

const BackgroundPattern = () => {
    const { colors, isDark } = useTheme();
    const patternColor = isDark ? colors.surfaceRaised : colors.surface;
    const opacity = 0.08;

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Ionicons 
                name="gift-outline" 
                size={300} 
                color={patternColor} 
                style={[styles.patternIcon, { top: -50, left: -100, opacity, transform: [{ rotate: '-15deg' }] }]} 
            />
            <Ionicons 
                name="heart-outline" 
                size={250} 
                color={patternColor} 
                style={[styles.patternIcon, { bottom: 100, right: -80, opacity, transform: [{ rotate: '20deg' }] }]} 
            />
            <Ionicons 
                name="star-outline" 
                size={180} 
                color={patternColor} 
                style={[styles.patternIcon, { top: '30%', right: -40, opacity, transform: [{ rotate: '45deg' }] }]} 
            />
            <Ionicons 
                name="calendar-outline" 
                size={220} 
                color={patternColor} 
                style={[styles.patternIcon, { bottom: -60, left: -40, opacity, transform: [{ rotate: '-10deg' }] }]} 
            />
            <Ionicons 
                name="notifications-outline" 
                size={150} 
                color={patternColor} 
                style={[styles.patternIcon, { top: '15%', right: '15%', opacity, transform: [{ rotate: '-20deg' }] }]} 
            />
        </View>
    );
};

export default function WelcomeScreen() {
    const router = useRouter();
    const { colors, spacing, isDark } = useTheme();
    const dispatch = useDispatch();
    const [googleAuth] = useGoogleAuthMutation();
    const [isSigningIn, setIsSigningIn] = React.useState(false);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: GOOGLE_CLIENT_ID,
            offlineAccess: true,
        });
    }, []);

    const handleGoogleLogin = async () => {
        if (isSigningIn) return;
        setIsSigningIn(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken;

            if (userInfo.type === 'success' && idToken) {
                console.log(idToken, "idToken")
                await googleAuth({ idToken }).unwrap();
                router.replace('/(tabs)');
            } else if (userInfo.type !== 'cancelled') {
                toast.error('Failed to retrieve Google ID Token.');
            }
        } catch (error: any) {
            if (error.code !== statusCodes.SIGN_IN_CANCELLED) {
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
                colors={isDark ? [colors.background, colors.primarySoft] : [colors.primary, colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <BackgroundPattern />
             
            <View style={styles.content}>
                <View style={styles.clusterWrapper}>
                    <View style={styles.clusterContainer}>
                        {/* Central Bubble */}
                        <Bubble
                            size={120}
                            color={colors.surface}
                            icon="gift"
                            delay={0}
                            top={0}
                            left={0}
                            iconColor={colors.primary}
                        />
                        
                        {/* Orbiting Bubbles - Using Theme Colors */}
                        <Bubble size={75} color={colors.accent} icon="calendar" delay={200} top={-90} left={25} />
                        <Bubble size={55} color={colors.success} icon="heart" delay={400} top={-35} right={-55} />
                        <Bubble size={65} color={colors.surfaceRaised} icon="chatbubbles" delay={600} right={-90} top={45} />
                        <Bubble size={50} color={colors.primarySoft} icon="notifications" delay={800} bottom={-35} right={-35} />
                        <Bubble size={60} color={colors.accent} icon="people" delay={1000} bottom={-85} left={35} />
                        <Bubble size={70} color={colors.success} icon="card" delay={1200} left={-95} top={35} />
                        <Bubble size={55} color={colors.primarySoft} icon="time" delay={1400} top={-55} left={-65} />
                    </View>
                </View>

                <Animated.View entering={FadeInDown.delay(800).duration(800)} style={styles.textContainer}>
                    <Typography variant="h1" align="center" style={[styles.title, { color: '#FFFFFF' }]}>
                        GiftSync
                    </Typography>
                    <Typography variant="body" align="center" color="#FFFFFF" style={styles.tagline}>
                        Never miss a moment that matters.{"\n"}Your relationships, remembered.
                    </Typography>
                </Animated.View>
            </View>

            <Animated.View 
                entering={FadeInDown.delay(1000).duration(800)} 
                style={[styles.footer, { padding: spacing.xl, paddingBottom: insets.bottom + 20 }]}
            >
                <Button
                    title="Sign In with Google"
                    onPress={handleGoogleLogin}
                    isLoading={isSigningIn}
                    size="lg"
                    style={[styles.mainBtn, { backgroundColor: colors.primary }]}
                    color="#FFFFFF"
                />

                <View style={styles.legalNotice}>
                    <Typography variant="caption" color="#FFFFFF" align="center" style={{ opacity: 0.7 }}>
                        By continuing, you agree to our{' '}
                        <Typography 
                            variant="caption" 
                            color="#FFFFFF" 
                            style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}
                            onPress={() => router.push('/profile/terms')}
                        >
                            Terms
                        </Typography>
                        {' '}and{' '}
                        <Typography 
                            variant="caption" 
                            color="#FFFFFF" 
                            style={{ fontWeight: 'bold', textDecorationLine: 'underline' }}
                            onPress={() => router.push('/profile/privacy')}
                        >
                            Privacy Policy
                        </Typography>
                    </Typography>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clusterWrapper: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 80,
    },
    clusterContainer: {
        width: 120,
        height: 120,
        position: 'relative',
    },
    bubble: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 12 },
        // shadowOpacity: 0.12,
        // shadowRadius: 16,
        // elevation: 10,
    },
    textContainer: {
        marginTop: 60,
        paddingHorizontal: 30,
    },
    title: {
        fontSize: moderateScale(40),
        marginBottom: 16,
    },
    tagline: {
        fontSize: moderateScale(17),
        lineHeight: 26,
        opacity: 0.8,
    },
    footer: {
        width: '100%',
    },
    mainBtn: {
        height: 64,
        borderRadius: 24,
    },
    patternIcon: {
        position: 'absolute',
    },
    legalNotice: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
});
