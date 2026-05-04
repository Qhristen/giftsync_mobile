import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { setPendingReferralCode } from '@/store/slices/authSlice';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function ReferralDeepLinkHandler() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { colors } = useTheme();

    useEffect(() => {
        if (code) {
            dispatch(setPendingReferralCode(code));
            // Redirect to referrals screen
            router.replace('/profile/referrals');
        } else {
            router.replace('/(tabs)');
        }
    }, [code]);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
}
