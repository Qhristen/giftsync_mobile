import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { completeOnboarding } from '@/store/slices/onboardingSlice';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const mockRecommendations = [
    { id: '1', name: 'Premium Leather Wallet', price: 'NGN 12,500', image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=400' },
    { id: '2', name: 'Artisan Scented Candle', price: 'NGN 8,000', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=400' },
    { id: '3', name: 'Gourmet Chocolate Box', price: 'NGN 15,000', image: 'https://images.unsplash.com/photo-1549007994-cb92caef72bc?auto=format&fit=crop&q=80&w=400' },
];

export default function OnboardingStep4() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, spacing } = useTheme();
    const onboarding = useSelector((state: RootState) => state.onboarding);

    const onFinish = () => {
        dispatch(completeOnboarding());
        router.replace('/(tabs)');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { padding: spacing.xl }]}>
                <ProgressBar progress={1} />
                <Typography variant="h2" style={{ marginTop: spacing.xl }}>
                    You're all set, {onboarding.profile.displayName || 'Friend'}! 🎁
                </Typography>
                <Typography variant="body" color={colors.textSecondary}>
                    Here are some gift ideas for upcoming events.
                </Typography>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: spacing.xl }]} showsVerticalScrollIndicator={false}>
                <Card variant="elevated" style={[styles.heroCard, { backgroundColor: colors.primary }]}>
                    <Typography variant="h3" color="#FFFFFF">Next Up: Alex's Birthday</Typography>
                    <Typography variant="body" color="#FFFFFF" style={{ opacity: 0.9 }}>In 12 days • March 24</Typography>
                    <View style={styles.heroAction}>
                        <Button title="Plan Gift" variant="secondary" size="sm" onPress={() => { }} />
                    </View>
                </Card>

                <Typography variant="h4" style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
                    AI Recommendations
                </Typography>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 16 }}
                >
                    {mockRecommendations.map((rec) => (
                        <Card key={rec.id} style={styles.recCard}>
                            <Image
                                source={{ uri: rec.image }}
                                style={styles.recImage}
                                contentFit="cover"
                            />
                            <View style={{ padding: 12 }}>
                                <Typography variant="bodyBold" numberOfLines={1}>{rec.name}</Typography>
                                <Typography variant="caption" color={colors.primary}>{rec.price}</Typography>
                                <Button title="View" size="sm" variant="outline" style={{ marginTop: 8 }} onPress={() => { }} />
                            </View>
                        </Card>
                    ))}
                </ScrollView>
            </ScrollView>

            <View style={[styles.footer, { padding: spacing.xl }]}>
                <Button
                    title="Go to Dashboard"
                    onPress={onFinish}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 80,
    },
    content: {
        flexGrow: 1,
    },
    heroCard: {
        padding: 24,
        borderRadius: 24,
        gap: 8,
    },
    heroAction: {
        marginTop: 16,
        alignSelf: 'flex-start',
    },
    recCard: {
        width: 200,
        // height: "auto",
        padding: 0,
    },
    recImage: {
        width: '100%',
        height: 120,
    },
    footer: {
        width: '100%',
    },
});
