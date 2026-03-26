import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const mockUpcoming = [
    { id: '1', name: 'Jamie Doe', type: 'Birthday', countdown: 'in 3 days', date: 'March 25' },
    { id: '2', name: 'Sam Smith', type: 'Anniversary', countdown: 'in 12 days', date: 'April 03' },
];

const mockRecs = [
    { id: '1', name: 'Floral Bouquet', price: 'NGN 15,000', vendor: 'Bloom Lagos', image: 'https://images.unsplash.com/photo-1522673607200-164883efbfc1?auto=format&fit=crop&q=80&w=400' },
    { id: '2', name: 'Luxury Hamper', price: 'NGN 45,000', vendor: 'GiftCo', image: 'https://images.unsplash.com/photo-1612470659132-841857908b8c?auto=format&fit=crop&q=80&w=400' },
    { id: '3', name: 'Personalised Mug', price: 'NGN 5,000', vendor: 'Print Shop', image: 'https://images.unsplash.com/photo-1542156822-6924d1a71965?auto=format&fit=crop&q=80&w=400' },
];

export default function HomeScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View entering={FadeInDown.duration(600)} style={[styles.header, { padding: spacing.xl }]}>
                    <View>
                        <Typography variant="body" color={colors.textSecondary}>Good morning, Alex 👋</Typography>
                        <Typography variant="h1">GiftSync</Typography>
                    </View>
                    <View style={styles.headerIcons}>
                        <Pressable style={[styles.iconBtn, { backgroundColor: colors.surfaceRaised }]} onPress={() => router.push('/notifications')}>
                            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
                            <View style={[styles.badge, { backgroundColor: colors.primary }]} />
                        </Pressable>
                        {/* <Avatar name="Alex" size="sm" /> */}
                    </View>
                </Animated.View>

                {/* Hero Carousel */}
                <Animated.View entering={FadeInDown.delay(200).duration(600)}>
                    <FlatList
                        data={mockUpcoming}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={{ width, paddingHorizontal: spacing.xl }}>
                                <Card variant="elevated" style={[styles.heroCard, { backgroundColor: colors.primary }]}>
                                    <View style={styles.heroHeader}>
                                        <Avatar name={item.name} size="lg" />
                                        <View>
                                            <Typography variant="h3" color="#FFFFFF">{item.name}</Typography>
                                            <Typography variant="body" color="#FFFFFF" style={{ opacity: 0.9 }}>{item.type}</Typography>
                                        </View>
                                    </View>
                                    <View style={styles.heroFooter}>
                                        <Typography variant="h2" color="#FFFFFF">{item.countdown}</Typography>
                                        <Button
                                            title="Get a Gift →"
                                            variant="secondary"
                                            size="sm"

                                            onPress={() => router.push({ pathname: '/checkout', params: { contactId: item.id, occasionId: 'birthday' } })}
                                        />
                                    </View>
                                </Card>
                            </View>
                        )}
                    />
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View entering={FadeInDown.delay(400).duration(600)} style={[styles.quickActions, { padding: spacing.xl }]}>
                    {[
                        { label: 'Coins', icon: 'wallet-outline', route: '/wallet' },
                        { label: 'Add Occasion', icon: 'calendar-outline', route: '/(tabs)/occasions' },
                        { label: 'Browse Shop', icon: 'cart-outline', route: '/(tabs)/shop' },
                        { label: 'View Orders', icon: 'list-outline', route: '/orders' }
                    ].map((act, idx) => (
                        <Pressable key={idx} style={styles.actionBtn} onPress={() => router.push(act.route as any)}>
                            <View style={[styles.actionIcon, { backgroundColor: colors.surfaceRaised }]}>
                                <Ionicons name={act.icon as any} size={24} color={colors.primary} />
                            </View>
                            <Typography variant="caption" color={colors.textSecondary} align="center">{act.label}</Typography>
                        </Pressable>
                    ))}
                </Animated.View>

                {/* This Month's Occasions */}
                <Animated.View entering={FadeInDown.delay(500).duration(600)} style={{ paddingHorizontal: spacing.xl }}>
                    <Typography variant="h4" style={{ marginBottom: spacing.md }}>This Month</Typography>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                        {['Sam Birthay', 'April Anniversary', 'Sarah Graduation', 'Mother Day'].map((occ, idx) => (
                            <Badge key={idx} label={occ} outline variant="primary" />
                        ))}
                    </ScrollView>
                </Animated.View>

                {/* AI Recommendations */}
                <Animated.View entering={FadeInDown.delay(600).duration(600)} style={{ marginTop: 32 }}>
                    <View style={[styles.sectionHeader, { paddingHorizontal: spacing.xl }]}>
                        <Typography variant="h4">Picked for Jamie's Birthday</Typography>
                        <Pressable><Typography variant="label" color={colors.primary}>See all →</Typography></Pressable>
                    </View>
                    <FlatList
                        data={mockRecs}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 16, paddingTop: spacing.md }}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Card style={styles.recCard} onPress={() => router.push(`/(tabs)/shop/${item.id}`)}>
                                <Image source={{ uri: item.image }} style={styles.recImage} contentFit="cover" />
                                <View style={{ padding: 12 }}>
                                    <Typography variant="bodyBold" numberOfLines={1}>{item.name}</Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>{item.vendor}</Typography>
                                    <View style={styles.recFooter}>
                                        <Typography variant="label" color={colors.primary}>{item.price}</Typography>
                                        <Ionicons name="heart-outline" size={20} color={colors.textMuted} />
                                    </View>
                                    <Button
                                        title="Send as Gift →"
                                        size="sm"
                                        style={{ marginTop: 12 }}
                                        onPress={() => { }}
                                    />
                                </View>
                            </Card>
                        )}
                    />
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: 10,
        right: 12,
    },
    heroCard: {
        padding: 24,
        borderRadius: 24,
        gap: 20,
    },
    heroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    heroFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    actionBtn: {
        alignItems: 'center',
        gap: 8,
        width: (width - 64) / 4,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recCard: {
        width: 220,
        padding: 0,
    },
    recImage: {
        width: '100%',
        height: 140,
    },
    recFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
});
