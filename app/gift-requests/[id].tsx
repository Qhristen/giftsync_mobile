import Button from '@/components/ui/Button';
import PaperScreenHeader from '@/components/ui/PaperScreenHeader';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { GiftRequestStatus, useGetGiftRequestQuery } from '@/store/api/giftRequestApi';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    CancelCircleIcon,
    CheckmarkCircle02Icon,
    CreditCardIcon,
    GiftIcon,
    RefreshIcon,
    Time02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from '@/utils/scaling';

const statusCopy: Record<GiftRequestStatus, { eyebrow: string; title: string; description: string }> = {
    PENDING: {
        eyebrow: 'PENDING REVIEW',
        title: 'We’ve got your brief',
        description: 'The sourcing team is reviewing your request. There is nothing to pay yet.',
    },
    SOURCING: {
        eyebrow: 'SOURCING',
        title: 'Your gift is being sourced',
        description: 'Your request has been approved. Review the final price and complete payment when ready.',
    },
    FULFILLED: {
        eyebrow: 'FULFILLED',
        title: 'Request completed',
        description: 'The sourcing team has completed this gift request.',
    },
    CANCELLED: {
        eyebrow: 'CANCELLED',
        title: 'Request cancelled',
        description: 'This gift request is no longer active.',
    },
};

export default function GiftRequestStatusScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, spacing } = useTheme();
    const params = useLocalSearchParams<{ id?: string | string[] }>();
    const giftRequestId = Array.isArray(params.id) ? params.id[0] : params.id;
    const {
        data: giftRequest,
        error,
        isLoading,
        isFetching,
        refetch,
    } = useGetGiftRequestQuery(giftRequestId || '', {
        skip: !giftRequestId,
        pollingInterval: 15000,
        refetchOnMountOrArgChange: true,
    });

    const order = giftRequest?.order;
    const canPay = giftRequest?.orderId != null && order?.paymentStatus === 'pending';
    const hasPaid = order?.paymentStatus === 'paid';
    const copy = giftRequest ? statusCopy[giftRequest.status] : null;
    const accent = giftRequest?.status === 'CANCELLED'
        ? colors.peach
        : giftRequest?.status === 'FULFILLED'
            ? colors.mint
            : giftRequest?.status === 'SOURCING'
                ? colors.lemon
                : colors.lilac;
    const statusIcon = giftRequest?.status === 'CANCELLED'
        ? CancelCircleIcon
        : giftRequest?.status === 'FULFILLED'
            ? CheckmarkCircle02Icon
            : giftRequest?.status === 'PENDING'
                ? Time02Icon
                : GiftIcon;
    const errorMessage = (error as { data?: { message?: string } } | undefined)?.data?.message;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <PaperScreenHeader
                eyebrow="Custom gift request"
                title="Request status"
                onBack={() => router.replace('/(tabs)/shop')}
                accent={accent}
            />

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Typography color={colors.textSecondary}>Checking your request…</Typography>
                </View>
            ) : !giftRequest ? (
                <View style={[styles.errorCard, { marginHorizontal: spacing.xl, backgroundColor: colors.surface, borderColor: colors.ink }]}>
                    <HugeiconsIcon icon={CancelCircleIcon} size={moderateScale(36)} color={colors.error} />
                    <Typography variant="h3">Couldn’t load this request</Typography>
                    <Typography color={colors.textSecondary} align="center">
                        {errorMessage || 'Check your connection and try again.'}
                    </Typography>
                    <Button title="Try again" onPress={() => refetch()} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={[styles.content, { paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + moderateScale(120) }]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.statusCard, { backgroundColor: accent, borderColor: colors.ink }]}>
                        <View style={[styles.statusIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={statusIcon} size={moderateScale(30)} color={colors.ink} />
                        </View>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>{copy?.eyebrow}</Typography>
                        <Typography variant="h1">{hasPaid && giftRequest.status === 'SOURCING' ? 'Payment received' : copy?.title}</Typography>
                        <Typography color={colors.textSecondary}>
                            {hasPaid && giftRequest.status === 'SOURCING'
                                ? 'Your order is processing. The request stays in sourcing until the team completes it.'
                                : copy?.description}
                        </Typography>
                    </View>

                    <View style={styles.sectionHeading}>
                        <Typography variant="label">Request details</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>#{giftRequest.id.slice(-8).toUpperCase()}</Typography>
                    </View>
                    <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        {giftRequest.recipientName && <DetailRow label="For" value={giftRequest.recipientName} />}
                        {giftRequest.description && <DetailRow label="Request" value={giftRequest.description} />}
                        {giftRequest.category && <DetailRow label="Category" value={giftRequest.category} />}
                        {giftRequest.budget != null && (
                            <DetailRow label="Suggested budget" value={formatCurrency(giftRequest.budget, giftRequest.currency)} />
                        )}
                    </View>

                    {order && (
                        <>
                            <View style={styles.sectionHeading}>
                                <Typography variant="label">Approved price</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>INCLUDES FEES</Typography>
                            </View>
                            <View style={[styles.receipt, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                {giftRequest.budget != null && (
                                    <PriceRow label="Your suggested budget" value={formatCurrency(giftRequest.budget, giftRequest.currency)} muted />
                                )}
                                <PriceRow label="Approved gift price" value={formatCurrency(order.subtotal, giftRequest.currency)} />
                                <PriceRow label="Delivery" value={formatCurrency(order.deliveryFee, giftRequest.currency)} />
                                <PriceRow label="Packaging" value={formatCurrency(order.packagingFee, giftRequest.currency)} />
                                <View style={[styles.divider, { borderColor: colors.ink }]} />
                                <View style={styles.totalRow}>
                                    <Typography variant="h3">Order total</Typography>
                                    <Typography variant="h2" color={colors.primary}>{formatCurrency(order.total, giftRequest.currency)}</Typography>
                                </View>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    The approved gift price may differ from your suggested budget.
                                </Typography>
                            </View>
                        </>
                    )}

                    <Button
                        title={isFetching ? 'Refreshing…' : 'Refresh status'}
                        variant="outline"
                        disabled={isFetching}
                        onPress={() => refetch()}
                        leftIcon={<HugeiconsIcon icon={RefreshIcon} size={moderateScale(18)} color={colors.primary} />}
                    />
                </ScrollView>
            )}

            {giftRequest && (
                <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + moderateScale(16), paddingHorizontal: spacing.xl }]}>
                    {canPay ? (
                        <Button
                            title={`Pay ${formatCurrency(order.total, giftRequest.currency)}`}
                            onPress={() => router.push({
                                pathname: '/checkout/payment',
                                params: {
                                    orderId: giftRequest.orderId!,
                                    giftRequestId: giftRequest.id,
                                    currency: giftRequest.currency,
                                },
                            })}
                            leftIcon={<HugeiconsIcon icon={CreditCardIcon} size={moderateScale(19)} color="#17151D" />}
                        />
                    ) : (
                        <Button title="Back to shop" variant="outline" onPress={() => router.replace('/(tabs)/shop')} />
                    )}
                </View>
            )}
        </View>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    const { colors } = useTheme();
    return (
        <View style={styles.detailRow}>
            <Typography variant="caption" color={colors.textSecondary}>{label.toUpperCase()}</Typography>
            <Typography variant="bodyBold" style={styles.detailValue}>{value}</Typography>
        </View>
    );
}

function PriceRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
    const { colors } = useTheme();
    return (
        <View style={styles.priceRow}>
            <Typography color={colors.textSecondary}>{label}</Typography>
            <Typography variant="bodyBold" color={muted ? colors.textSecondary : undefined}>{value}</Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: moderateScale(12) },
    content: { gap: moderateScale(14), paddingTop: moderateScale(4) },
    errorCard: { borderWidth: 1.5, borderRadius: moderateScale(22), padding: moderateScale(22), alignItems: 'center', gap: moderateScale(14) },
    statusCard: { borderWidth: 1.5, borderRadius: moderateScale(25), padding: moderateScale(22), gap: moderateScale(8) },
    statusIcon: { width: moderateScale(58), height: moderateScale(58), borderWidth: 1.5, borderRadius: moderateScale(18), alignItems: 'center', justifyContent: 'center', marginBottom: moderateScale(4), transform: [{ rotate: '-3deg' }] },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(0.9) },
    sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: moderateScale(8) },
    detailsCard: { borderWidth: 1.5, borderRadius: moderateScale(20), paddingHorizontal: moderateScale(17) },
    detailRow: { paddingVertical: moderateScale(14), gap: moderateScale(4) },
    detailValue: { flexShrink: 1 },
    receipt: { borderWidth: 1.5, borderRadius: moderateScale(20), padding: moderateScale(17), gap: moderateScale(10) },
    priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: moderateScale(14) },
    divider: { borderTopWidth: 1.5, borderStyle: 'dashed', marginVertical: moderateScale(3) },
    totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: moderateScale(14) },
    footer: { position: 'absolute', left: moderateScale(0), right: moderateScale(0), bottom: moderateScale(0), paddingTop: moderateScale(12) },
});
