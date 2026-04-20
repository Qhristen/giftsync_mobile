import { useTheme } from '@/hooks/useTheme';
import { Business, PaginatedReviewResponse } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { forwardRef } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
import Avatar from '../ui/Avatar';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

interface Props {
    business?: Business | null;
    ratingAvg?: number;
    ratingCount?: number;
    reviews?: PaginatedReviewResponse;
    isLoadingReviews?: boolean;
}

const VendorDetailSheet = forwardRef<BottomSheetRef, Props>(
    ({ business, ratingAvg, ratingCount, reviews, isLoadingReviews }, ref) => {
        const { spacing, colors } = useTheme();

        const handleWebsite = () => {
            if (business?.websiteUrl) {
                Linking.openURL(business.websiteUrl).catch(() => { });
            }
        };

        const handleInstagram = () => {
            const handle = business?.instagramHandle;
            if (handle) {
                const url = `https://instagram.com/${handle.replace('@', '')}`;
                Linking.openURL(url).catch(() => { });
            }
        };

        if (!business) return null;

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['60%', '90%']} scrollable>
                <View style={{ paddingBottom: spacing.xl * 2 }}>
                    {/* Header */}
                    <View style={styles.header}>
                        {business.logoUrl ? (
                            <Image
                                source={{ uri: business.logoUrl }}
                                style={[styles.logo, { borderColor: colors.border }]}
                                contentFit="cover"
                            />
                        ) : (
                            <Avatar name={business.name || 'Vendor'} size="xl" />
                        )}
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Typography variant="h2" numberOfLines={2}>{business.name}</Typography>
                            {business.location && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                                    <Typography variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
                                        {business.location}
                                    </Typography>
                                </View>
                            )}
                            <View style={[styles.infoRow, { marginTop: 6 }]}>
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Typography variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
                                    {Number(ratingAvg ?? 0).toFixed(1)} · {ratingCount ?? 0} {(ratingCount ?? 0) === 1 ? 'review' : 'reviews'}
                                </Typography>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    {business.description ? (
                        <View style={{ marginTop: spacing.lg }}>
                            <Typography variant="h4" style={{ marginBottom: spacing.sm }}>About</Typography>
                            <Typography variant="body" color={colors.textSecondary} style={{ lineHeight: 22 }}>
                                {business.description}
                            </Typography>
                        </View>
                    ) : null}

                    {/* Social / Links */}
                    <View style={[styles.actionsRow, { marginTop: spacing.xl }]}>
                        {business.websiteUrl && (
                            <Button
                                title="Visit Website"
                                variant="outline"
                                style={{ flex: 1 }}
                                leftIcon={<Ionicons name="globe-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />}
                                onPress={handleWebsite}
                            />
                        )}
                        {business.instagramHandle && (
                            <Button
                                title="Instagram"
                                variant="outline"
                                style={{ flex: 1 }}
                                leftIcon={<Ionicons name="logo-instagram" size={18} color={colors.primary} style={{ marginRight: 6 }} />}
                                onPress={handleInstagram}
                            />
                        )}
                    </View>

                    {/* Reviews Section */}
                    <View style={{ marginTop: spacing.xl }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                            <Typography variant="h4">Reviews</Typography>
                        </View>

                        {isLoadingReviews && !reviews ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : reviews?.items?.length ? (
                            <View style={{ gap: 12 }}>
                                {reviews.items.map((review: any) => (
                                    <View key={review.id} style={{ padding: 12, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <Typography variant="bodyBold">{review.user?.name || 'User'}</Typography>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Ionicons name="star" size={14} color="#FFD700" />
                                                <Typography variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>{review.rating}</Typography>
                                            </View>
                                        </View>
                                        {review.comment && (
                                            <Typography variant="body" color={colors.textSecondary} style={{ marginTop: 4 }}>{review.comment}</Typography>
                                        )}
                                        <Typography variant="caption" color={colors.textMuted} style={{ marginTop: 8 }}>
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Typography variant="body" color={colors.textMuted}>No reviews yet.</Typography>
                        )}
                    </View>
                </View>
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 72,
        height: 72,
        borderRadius: 18,
        borderWidth: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statBadge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    contactCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
        borderBottomWidth: 1,
    },
    contactIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
});

export default VendorDetailSheet;
