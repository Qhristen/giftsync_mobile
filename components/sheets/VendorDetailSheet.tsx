import { useTheme } from '@/hooks/useTheme';
import { Business } from '@/types';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    GlobalIcon,
    InstagramIcon,
    StarIcon,
} from '@hugeicons/core-free-icons';
import { Image } from 'expo-image';
import React, { forwardRef } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import Avatar from '../ui/Avatar';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';
import { moderateScale } from '@/utils/scaling';

interface Props {
    business?: Business | null;
    ratingAvg?: number;
    ratingCount?: number;
}

const VendorDetailSheet = forwardRef<BottomSheetRef, Props>(
    ({ business, ratingAvg, ratingCount }, ref) => {
        const { spacing, colors } = useTheme();

        const handleWebsite = () => {
            if (business?.websiteUrl) {
                const url = /^https?:\/\//i.test(business.websiteUrl)
                    ? business.websiteUrl
                    : `https://${business.websiteUrl}`;
                Linking.openURL(url).catch(() => { });
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
            <BottomSheetWrapper ref={ref} snapPoints={['15%']} scrollable>
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
                        <View style={{ flex: 1, marginLeft: moderateScale(16) }}>
                            <Typography variant="h2" numberOfLines={2}>{business.name}</Typography>
                            {/* {business.location && (
                                <View style={styles.infoRow}>
                                    <HugeiconsIcon icon={Location01Icon} size={moderateScale(14)} color={colors.textSecondary} />
                                    <Typography variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
                                        {business.location}
                                    </Typography>
                                </View>
                            )} */}
                            <View style={[styles.infoRow, { marginTop: moderateScale(6) }]}>
                                <HugeiconsIcon icon={StarIcon} size={moderateScale(14)} color="#FFD700" />
                                <Typography variant="caption" color={colors.textSecondary} style={{ marginLeft: moderateScale(4) }}>
                                    {Number(ratingAvg ?? 0).toFixed(1)} · {ratingCount ?? 0} {(ratingCount ?? 0) === 1 ? 'review' : 'reviews'}
                                </Typography>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    {business.description ? (
                        <View style={{ marginTop: spacing.lg }}>
                            <Typography variant="h4" style={{ marginBottom: spacing.sm }}>About</Typography>
                            <Typography variant="body" color={colors.textSecondary} style={{ lineHeight: moderateScale(22) }}>
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
                                leftIcon={<HugeiconsIcon icon={GlobalIcon} size={moderateScale(18)} color={colors.primary} style={{ marginRight: moderateScale(6) }} />}
                                onPress={handleWebsite}
                            />
                        )}
                        {business.instagramHandle && (
                            <Button
                                title="Instagram"
                                variant="outline"
                                style={{ flex: 1 }}
                                leftIcon={<HugeiconsIcon icon={InstagramIcon} size={moderateScale(18)} color={colors.primary} style={{ marginRight: moderateScale(6) }} />}
                                onPress={handleInstagram}
                            />
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
        width: moderateScale(72),
        height: moderateScale(72),
        borderRadius: moderateScale(18),
        borderWidth: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: moderateScale(4),
    },
    statsRow: {
        flexDirection: 'row',
        gap: moderateScale(12),
    },
    statBadge: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: moderateScale(10),
        paddingHorizontal: moderateScale(14),
        borderRadius: moderateScale(12),
        borderWidth: 1,
    },
    contactCard: {
        borderRadius: moderateScale(16),
        borderWidth: 1,
        overflow: 'hidden',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(14),
        gap: moderateScale(12),
        borderBottomWidth: 1,
    },
    contactIcon: {
        width: moderateScale(34),
        height: moderateScale(34),
        borderRadius: moderateScale(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionsRow: {
        flexDirection: 'row',
        gap: moderateScale(12),
    },
});

VendorDetailSheet.displayName = 'VendorDetailSheet';

export default VendorDetailSheet;
