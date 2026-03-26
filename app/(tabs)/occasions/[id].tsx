import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { toast } from 'sonner-native';

const { width } = Dimensions.get('window');

const RECOMMENDED_GIFTS = [
    { id: 'g1', name: 'Digital Art Frame', price: 'NGN 85,000', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400' },
    { id: 'g2', name: 'Gourmet Coffee Set', price: 'NGN 25,000', image: 'https://images.unsplash.com/photo-1498622205843-c15e21932386?auto=format&fit=crop&q=80&w=400' },
    { id: 'g3', name: 'Luxury Watch', price: 'NGN 150,000', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=400' },
];

export default function OccasionDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const occasions = useSelector((state: RootState) => state.occasions.items);
    const occasion = occasions.find(o => o.id === id) || {
        id: '1',
        name: 'Jamie Doe',
        type: 'Birthday',
        date: 'March 25',
        countdown: 'in 3 days',
        dotColor: 'green',
        avatarUrl: undefined,
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header Area */}
            <View style={[styles.headerBg, { backgroundColor: colors.primary }]}>
                <View style={[styles.header, { top: spacing.xl, paddingHorizontal: spacing.xl }]}>
                    <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </Pressable>
                    <Typography variant="h4" color="#FFF">Occasion Details</Typography>
                    <Pressable style={styles.iconBtn}>
                        <Ionicons name="create-outline" size={24} color="#FFF" />
                    </Pressable>
                </View>

                <Animated.View entering={FadeInDown.duration(500)} style={styles.heroContent}>
                    <Avatar uri={occasion.avatarUrl} name={occasion.name} size="xl" />
                    <Typography variant="h1" color="#FFF" style={{ marginTop: 16 }}>{occasion.name}</Typography>
                    <Badge label={`${occasion.type} • ${occasion.date}`} variant="primary" style={{ marginTop: 8, alignSelf: 'center' }} />
                    <Typography variant="h2" color="#FFF" style={{ marginTop: 24 }}>{occasion.countdown}</Typography>
                </Animated.View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInUp.delay(200).duration(500)} style={[styles.content, { padding: spacing.xl }]}>

                    {/* Action Cards */}
                    <View style={styles.actionGrid}>
                        <Card style={[styles.actionCard, { backgroundColor: colors.primarySoft }]} onPress={() => router.push('/checkout')}>
                            <Ionicons name="gift" size={32} color={colors.primary} />
                            <Typography variant="bodyBold" style={{ marginTop: 12 }}>Send a Gift</Typography>
                            <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>
                                Find the perfect present instantly
                            </Typography>
                        </Card>
                        <Card style={[styles.actionCard, { backgroundColor: colors.surfaceRaised }]} onPress={() => toast('AI Gift Generator', {
                            description: 'Spend 5 coins to generate highly personalized AI gifts?',
                            action: {
                                label: 'Generate',
                                onClick: () => {
                                    // Handle logic for generating gifts
                                    console.log('Generating AI gifts...');
                                }
                            }
                        })}>
                            <Ionicons name="sparkles" size={32} color={colors.textPrimary} />
                            <Typography variant="bodyBold" style={{ marginTop: 12 }}>Ask AI Ideas</Typography>
                            <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>
                                Get curated ideas for 5 coins
                            </Typography>
                        </Card>
                    </View>

                    {/* AI Gift Recommendations */}
                    <View style={{ marginTop: spacing.xl * 1.5 }}>
                        <View style={styles.sectionHeader}>
                            <Typography variant="h3">AI Recommendations</Typography>
                            <Typography variant="label" color={colors.primary}>View all</Typography>
                        </View>
                        <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
                            Based on {occasion.name}'s past preferences and trending {occasion.type.toLowerCase()} gifts.
                        </Typography>

                        <FlatList
                            data={RECOMMENDED_GIFTS}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 16, paddingRight: spacing.xl, paddingBottom: spacing.sm }}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Card style={styles.recCard} onPress={() => router.push(`/(tabs)/shop/${item.id}`)}>
                                    <Image source={{ uri: item.image }} style={styles.recImage} contentFit="cover" />
                                    <View style={{ padding: 12 }}>
                                        <Typography variant="bodyBold" numberOfLines={1}>{item.name}</Typography>
                                        <Typography variant="label" color={colors.primary} style={{ marginTop: 4 }}>{item.price}</Typography>
                                    </View>
                                </Card>
                            )}
                        />
                    </View>
                </Animated.View>
            </ScrollView>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBg: {
        paddingTop: 60,
        paddingBottom: 40,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    header: {
        position: 'absolute',
        zIndex: 10,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
    },
    iconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroContent: {
        alignItems: 'center',
        marginTop: 60,
    },
    content: {
        marginTop: -20,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 24,
    },
    actionCard: {
        flex: 1,
        padding: 20,
        alignItems: 'flex-start',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    recCard: {
        width: 160,
        padding: 0,
        overflow: 'hidden',
    },
    recImage: {
        width: '100%',
        height: 140,
    },
});
