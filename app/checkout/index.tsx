import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetOccasionDetailQuery } from '@/store/api/occasionApi';
import { useGetProductByIdQuery } from '@/store/api/productApi';
import { calculateDeliveryStatus } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function CheckoutEntry() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const { occasionId, productId } = useLocalSearchParams<{ occasionId: string; productId: string }>();

    const { data: occasion, isLoading: initialOccasionLoading, isFetching: isOccasionFetching } = useGetOccasionDetailQuery(occasionId as string, { skip: !occasionId });
    const isOccasionLoading = initialOccasionLoading || isOccasionFetching;

    const { data: product, isLoading: initialProductLoading, isFetching: isProductFetching } = useGetProductByIdQuery(productId as string, { skip: !productId });
    const isProductLoading = initialProductLoading || isProductFetching;

    const deliveryStatus = useMemo(() => {
        if (!product || !occasion) return null;
        return calculateDeliveryStatus(occasion.date, product.deliveryDays, occasion.contact?.name);
    }, [product, occasion]);

    const handleNext = () => {
        router.push({ pathname: '/checkout/delivery', params: { occasionId, productId } });
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { padding: spacing.xl, paddingBottom: spacing.md }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h2">Confirm Your Gift</Typography>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { padding: spacing.xl }]}>
                {/* Recipient Card */}
                <Typography variant="label" style={{ marginBottom: spacing.sm }}>Recipient & Occasion</Typography>
                <Card variant="outline" style={styles.contextCard}>
                    {isOccasionLoading ? (
                        <ActivityIndicator />
                    ) : (
                        <>
                            <View style={styles.contextRow}>
                                <Avatar name={occasion?.contact?.name || 'Recipient'} uri={occasion?.contact?.avatar} size="lg" />
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Typography variant="bodyBold" style={{ fontSize: 16 }}>{occasion?.contact?.name || 'Not Selected'}</Typography>
                                        <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
                                            <Typography variant="caption" color={colors.primary} style={{ fontSize: 10 }}>RECIPIENT</Typography>
                                        </View>
                                    </View>
                                    {occasion && <Typography variant="caption" color={colors.textSecondary}>{occasion.title}</Typography>}
                                </View>
                            </View>

                            <View style={[styles.divider, { backgroundColor: colors.border }]} />

                            <View style={styles.contextRow}>
                                <View style={[styles.iconBox, { backgroundColor: colors.surfaceRaised }]}>
                                    <Ionicons name="calendar" size={20} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Typography variant="bodyMedium" style={{ fontWeight: '600' }}>{occasion?.title || 'Occasion Date'}</Typography>
                                    {occasion && <Typography variant="caption" color={colors.textSecondary}>
                                        {new Date(occasion.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </Typography>}
                                </View>
                            </View>
                        </>
                    )}
                </Card>

                {/* Delivery Status Card */}
                {deliveryStatus && (
                    <View style={{ marginTop: spacing.xl }}>
                        <Typography variant="label" style={{ marginBottom: spacing.sm }}>Estimated Delivery</Typography>
                        <Card
                            variant="elevated"
                            style={[
                                styles.deliveryCard,
                                { backgroundColor: deliveryStatus.canArriveOnTime ? colors.success + '15' : colors.error + '15' }
                            ]}
                        >
                            <View style={[styles.deliveryIcon, { backgroundColor: deliveryStatus.canArriveOnTime ? colors.success : colors.error }]}>
                                <Ionicons
                                    name={deliveryStatus.canArriveOnTime ? "time-outline" : "alert-circle-outline"}
                                    size={20}
                                    color="#FFF"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Typography variant="bodyBold" color={deliveryStatus.canArriveOnTime ? colors.success : colors.error}>
                                    {deliveryStatus.canArriveOnTime ? 'On-time delivery' : 'Potential Delay'}
                                </Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    Estimated arrival: {deliveryStatus.arrivalDate}
                                </Typography>
                                <View style={{ height: 4 }} />
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {deliveryStatus.recipientName}'s event is in {deliveryStatus.daysToOccasion} days. Delivery takes {deliveryStatus.deliveryDays} days.
                                </Typography>
                            </View>
                        </Card>
                    </View>
                )}

                {/* Gift Card */}
                <Typography variant="label" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Selected Gift</Typography>
                <Card variant="outline" style={styles.giftCard}>
                    {isProductLoading ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : (
                        <>
                            {product?.imageUrls?.[0] ? (
                                <Image source={{ uri: product.imageUrls[0] }} style={styles.giftImagePlaceholder} contentFit="cover" />
                            ) : (
                                <View style={styles.giftImagePlaceholder} />
                            )}
                            <View style={{ flex: 1 }}>
                                <Typography variant="bodyBold">{product?.name || 'Select a Gift'}</Typography>
                                {product && <Typography variant="caption" color={colors.textSecondary}>Provider: {product.business?.name}</Typography>}
                                <Typography variant="label" color={colors.primary} style={{ marginTop: 4 }}>
                                    {product ? formatCurrency((Number(product.price) || 0) + (Number(product.deliveryFee) || 0) + (Number(product.packagingFee) || 0), product.currency) : '---'}
                                </Typography>
                            </View>
                        </>
                    )}
                </Card>
            </ScrollView>

            {/* Footer CTA */}
            <View style={[styles.footer, { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Button
                    title="Looks good, Continue →"
                    onPress={handleNext}
                    style={styles.submitBtn}
                    disabled={!occasion || !product}
                />
            </View>
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
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        padding: 8,
    },
    content: {
        flexGrow: 1,
    },
    contextCard: {
        padding: 16,
        gap: 16,
    },
    contextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    giftCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    giftImagePlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    deliveryCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        gap: 12,
        borderRadius: 16,
    },
    deliveryIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        width: '100%',
    },
    submitBtn: {
        width: '100%',
    },
});
