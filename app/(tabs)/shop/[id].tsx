import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Mock Data
const ITEM_DETAILS = {
    id: '1',
    name: 'Premium Leather Wallet',
    price: 'NGN 12,500',
    description: "Crafted from full-grain genuine leather, this minimalist wallet combines elegance with everyday functionality. Features RFID protection, 6 card slots, and a sleek profile that slides easily into any pocket.",
    vendor: { name: 'Amani Leather', avatar: null, rating: 4.8, reviews: 124 },
    images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1559564257-2e1d70e0a5cc?auto=format&fit=crop&q=80&w=800',
    ],
    features: ['100% Full-grain leather', 'RFID Blocking', '6 Card Slots', 'Gift Box Included']
};

export default function ShopItemDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { top: spacing.xl, paddingHorizontal: spacing.xl, backgroundColor: 'transparent' }]}>
                <Pressable onPress={() => router.back()} style={[styles.iconBtn, { backgroundColor: colors.surfaceRaised }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Pressable style={[styles.iconBtn, { backgroundColor: colors.surfaceRaised }]}>
                    <Ionicons name="heart-outline" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 90 }}>
                {/* Image Gallery */}
                <Animated.View entering={FadeInDown.duration(500)}>
                    <FlatList
                        data={ITEM_DETAILS.images}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
                        }}
                        keyExtractor={(_, i) => i.toString()}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item }} style={{ width, height: width * 1.1 }} contentFit="cover" />
                        )}
                    />
                    <View style={styles.pagination}>
                        {ITEM_DETAILS.images.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    { backgroundColor: i === activeIndex ? colors.primary : 'rgba(255,255,255,0.5)' },
                                    i === activeIndex && { width: 16 }
                                ]}
                            />
                        ))}
                    </View>
                </Animated.View>

                {/* Details */}
                <Animated.View entering={FadeInUp.delay(200).duration(500)} style={[styles.details, { padding: spacing.xl, backgroundColor: colors.surface }]}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <Typography variant="h2">{ITEM_DETAILS.name}</Typography>
                            <Typography variant="h3" color={colors.primary} style={{ marginTop: 4 }}>{ITEM_DETAILS.price}</Typography>
                        </View>
                        <View style={[styles.ratingBadge, { backgroundColor: colors.surfaceRaised }]}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Typography variant="bodyBold" style={{ marginLeft: 4 }}>{ITEM_DETAILS.vendor.rating}</Typography>
                        </View>
                    </View>

                    <Card variant="outline" style={[styles.vendorCard, { borderColor: colors.border, marginTop: spacing.lg }]}>
                        <Avatar name={ITEM_DETAILS.vendor.name} size="md" />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Typography variant="bodyBold">Sold by {ITEM_DETAILS.vendor.name}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>{ITEM_DETAILS.vendor.reviews} Reviews</Typography>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </Card>

                    <View style={{ marginTop: spacing.xl }}>
                        <Typography variant="h4" style={{ marginBottom: spacing.sm }}>Description</Typography>
                        <Typography variant="body" color={colors.textSecondary} style={{ lineHeight: 24 }}>
                            {ITEM_DETAILS.description}
                        </Typography>
                    </View>

                    <View style={{ marginTop: spacing.xl }}>
                        <Typography variant="h4" style={{ marginBottom: spacing.md }}>Key Features</Typography>
                        {ITEM_DETAILS.features.map((feature, idx) => (
                            <View key={idx} style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                <Typography variant="body" color={colors.textSecondary} style={{ marginLeft: 12 }}>
                                    {feature}
                                </Typography>
                            </View>
                        ))}
                    </View>
                </Animated.View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <Button
                    title="Send as Gift"
                    variant="primary"
                    style={{ flex: 1 }}
                    leftIcon={<Ionicons name="gift-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />}
                    onPress={() => router.push({ pathname: '/checkout', params: { itemId: id } })}
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
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 24,
        alignSelf: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    details: {
        marginTop: -32,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    vendorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 24,
        // borderTopWidth: 1,
        // elevation: 10,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: -2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 10,
    },
});
