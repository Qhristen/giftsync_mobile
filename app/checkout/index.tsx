import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import CheckoutSkeleton from '@/components/skeletons/CheckoutSkeleton';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { usePlatformConfig } from '@/hooks/usePlatformConfig';
import { useTheme } from '@/hooks/useTheme';
import { useGetEventDetailQuery } from '@/store/api/event';
import { useGetProductByIdQuery } from '@/store/api/productApi';
import { calculateDeliveryStatus } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { AlertCircleIcon, Calendar01Icon, Time02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from '@/utils/scaling';

export default function CheckoutEntry() {
    const router = useRouter();
    const { colors } = useTheme();
    const { deliveryFeeNgn, packagingFeeNgn } = usePlatformConfig();
    const { occasionId, productId } = useLocalSearchParams<{ occasionId: string; productId: string }>();
    const insets = useSafeAreaInsets();

    const { data: event, isLoading: initialEventLoading, isFetching: isEventFetching } = useGetEventDetailQuery(occasionId as string, { skip: !occasionId });
    const { data: product, isLoading: initialProductLoading, isFetching: isProductFetching } = useGetProductByIdQuery(productId as string, { skip: !productId });
    const isLoading = initialEventLoading || isEventFetching || initialProductLoading || isProductFetching;

    const deliveryStatus = useMemo(() => {
        if (!product || !event) return null;
        return calculateDeliveryStatus(event.date, product.deliveryDays, event.contact?.name);
    }, [product, event]);

    const fees = useMemo(() => {
        const item = Number(product?.price) || 0;
        const delivery = Number(product?.deliveryFee || deliveryFeeNgn) || 0;
        const packaging = Number(product?.packagingFee || packagingFeeNgn) || 0;
        return { item, delivery, packaging, total: item + delivery + packaging };
    }, [deliveryFeeNgn, packagingFeeNgn, product]);

    if (isLoading) {
        return <CheckoutSkeleton step={1} onBack={() => router.back()} />;
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CheckoutProgress
                step={1}
                eyebrow="Gift check"
                title="Check the gift brief"
                onBack={() => router.back()}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.briefCard, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                    <View style={[styles.tape, { backgroundColor: colors.lilac, borderColor: colors.ink }]} />
                    <View style={styles.recipientRow}>
                        <Avatar name={event?.contact?.name || 'Recipient'} uri={event?.contact?.avatar} size="lg" />
                        <View style={styles.recipientCopy}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>TO: SOMEONE SPECIAL</Typography>
                            <Typography variant="h3">{event?.contact?.name || 'Recipient'}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>{event?.title || 'A lovely occasion'}</Typography>
                        </View>
                        <View style={[styles.dateStamp, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={Calendar01Icon} size={moderateScale(17)} color={colors.ink} />
                            <Typography variant="caption" style={styles.dateStampText}>
                                {event?.date
                                    ? new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()
                                    : 'DATE'}
                            </Typography>
                        </View>
                    </View>

                    <View style={[styles.giftPolaroid, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        {product?.imageUrls?.[0] ? (
                            <Image source={{ uri: product.imageUrls[0] }} style={styles.giftImage} contentFit="cover" />
                        ) : (
                            <View style={[styles.giftImage, { backgroundColor: colors.lavender }]} />
                        )}
                        <View style={styles.giftCopy}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE PICK</Typography>
                            <Typography variant="h4" numberOfLines={2}>{product?.name || 'Selected gift'}</Typography>
                            <Typography variant="caption" color={colors.textSecondary} numberOfLines={1}>
                                Curated by {product?.business?.name || 'GiftSync'}
                            </Typography>
                        </View>
                    </View>
                </View>

                {deliveryStatus ? (
                    <View
                        style={[
                            styles.deliveryNote,
                            {
                                backgroundColor: deliveryStatus.canArriveOnTime ? colors.mint : colors.peach,
                                borderColor: colors.ink,
                            },
                        ]}
                    >
                        <View style={[styles.noteIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <HugeiconsIcon
                                icon={deliveryStatus.canArriveOnTime ? Time02Icon : AlertCircleIcon}
                                size={moderateScale(20)}
                                color={colors.ink}
                            />
                        </View>
                        <View style={styles.noteCopy}>
                            <Typography variant="bodyBold">
                                {deliveryStatus.canArriveOnTime ? 'The timing looks great' : 'This one may arrive late'}
                            </Typography>
                            <Typography variant="caption" color={colors.textSecondary}>
                                ETA {deliveryStatus.arrivalDate} · {deliveryStatus.deliveryDays} delivery days before {deliveryStatus.recipientName}&apos;s moment.
                            </Typography>
                        </View>
                        <Typography variant="h3">{deliveryStatus.canArriveOnTime ? '✓' : '!'}</Typography>
                    </View>
                ) : null}

                <View style={styles.sectionHeading}>
                    <Typography variant="label">Packing receipt</Typography>
                    <Typography variant="caption" color={colors.textSecondary}>ESTIMATE</Typography>
                </View>
                <View style={[styles.receipt, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                    <ReceiptRow label="Gift" value={formatCurrency(fees.item, product?.currency)} />
                    <ReceiptRow label="Delivery" value={formatCurrency(fees.delivery, product?.currency)} />
                    <ReceiptRow label="Gift wrapping" value={formatCurrency(fees.packaging, product?.currency)} />
                    <View style={[styles.dashedLine, { borderColor: colors.textMuted }]} />
                    <View style={styles.totalRow}>
                        <View style={styles.totalCopy}>
                            <Typography variant="caption" color={colors.textSecondary}>ESTIMATED TOTAL</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Confirmed before payment</Typography>
                        </View>
                        <Typography variant="h3">{formatCurrency(fees.total, product?.currency)}</Typography>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + moderateScale(16) }]}>
                <Button
                    title="Wrap it & plan delivery  →"
                    onPress={() => router.push({ pathname: '/checkout/delivery', params: { occasionId, productId } })}
                    disabled={!event || !product}
                    style={styles.submitButton}
                />
            </View>
        </View>
    );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
    const { colors } = useTheme();
    return (
        <View style={styles.receiptRow}>
            <Typography variant="body" color={colors.textSecondary}>{label}</Typography>
            <Typography variant="bodyBold">{value}</Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: moderateScale(20), paddingTop: moderateScale(8), paddingBottom: moderateScale(130), gap: moderateScale(20) },
    briefCard: {
        borderWidth: 1.5,
        borderRadius: moderateScale(26),
        padding: moderateScale(18),
        gap: moderateScale(18),

        transform: [{ rotate: '-0.7deg' }],
    },
    tape: {
        position: 'absolute',
        top: moderateScale(-10),
        left: '42%',
        width: moderateScale(66),
        height: moderateScale(22),
        borderWidth: 1,
        opacity: 0.88,
        transform: [{ rotate: '3deg' }],
        zIndex: 2,
    },
    recipientRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
    recipientCopy: { flex: 1 },
    overline: { letterSpacing: moderateScale(1.1), fontWeight: '700' },
    dateStamp: {
        alignItems: 'center',
        gap: moderateScale(2),
        borderWidth: 1.5,
        borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(9),
        paddingVertical: moderateScale(8),
        transform: [{ rotate: '4deg' }],
    },
    dateStampText: { fontWeight: '800' },
    giftPolaroid: {
        flexDirection: 'row',
        padding: moderateScale(9),
        gap: moderateScale(13),
        borderWidth: 1.5,
        borderRadius: moderateScale(19),

        transform: [{ rotate: '1.2deg' }],
    },
    giftImage: { width: moderateScale(106), height: moderateScale(106), borderRadius: moderateScale(13) },
    giftCopy: { flex: 1, justifyContent: 'center', gap: moderateScale(3) },
    deliveryNote: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(12),
        borderWidth: 1.5,
        borderRadius: moderateScale(19),
        padding: moderateScale(14),
    },
    noteIcon: { width: moderateScale(40), height: moderateScale(40), borderRadius: moderateScale(13), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    noteCopy: { flex: 1 },
    sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    receipt: {
        borderWidth: 1.5,
        borderRadius: moderateScale(22),
        padding: moderateScale(18),
        gap: moderateScale(11),

        transform: [{ rotate: '0.6deg' }],
    },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', gap: moderateScale(16) },
    dashedLine: { borderTopWidth: 1, borderStyle: 'dashed', marginVertical: moderateScale(4) },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: moderateScale(12) },
    totalCopy: { flex: 1 },
    footer: { position: 'absolute', left: moderateScale(0), right: moderateScale(0), bottom: moderateScale(0), paddingHorizontal: moderateScale(20), paddingTop: moderateScale(14) },
    submitButton: { width: '100%' },
});
