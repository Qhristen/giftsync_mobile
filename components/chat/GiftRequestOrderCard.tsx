import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import type { GiftRequestOrder } from '@/store/api/giftRequestApi';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    CheckmarkCircle02Icon,
    CreditCardIcon,
    GiftIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { StyleSheet, View } from 'react-native';
import { moderateScale } from '@/utils/scaling';

interface GiftRequestOrderCardProps {
    order: GiftRequestOrder;
    currency: string;
    recipientName?: string;
    category?: string;
    onPay: () => void;
}

export default function GiftRequestOrderCard({
    order,
    currency,
    recipientName,
    category,
    onPay,
}: GiftRequestOrderCardProps) {
    const { colors, spacing } = useTheme();
    const canPay = order.paymentStatus === 'pending' && order.status !== 'Cancelled' && order.total > 0;
    const hasPaid = order.paymentStatus === 'paid';

    return (
        <View style={[styles.wrapper, { paddingHorizontal: spacing.xl, marginBottom: spacing.md }]}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                <View style={[styles.banner, { backgroundColor: hasPaid ? colors.mint : colors.lemon }]}>
                    <View style={[styles.iconBox, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon
                            icon={hasPaid ? CheckmarkCircle02Icon : GiftIcon}
                            size={moderateScale(24)}
                            color={colors.ink}
                        />
                    </View>
                    <View style={styles.headingCopy}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>
                            {hasPaid ? 'PAYMENT RECEIVED' : 'REQUEST ACCEPTED'}
                        </Typography>
                        <Typography variant="h4">
                            {hasPaid ? 'Your order is paid' : 'Your order is ready'}
                        </Typography>
                    </View>
                </View>

                <View style={styles.body}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryCopy}>
                            <Typography variant="bodyBold" numberOfLines={2}>
                                {category || 'Custom gift request'}
                            </Typography>
                            {!!recipientName && (
                                <Typography variant="caption" color={colors.textSecondary}>
                                    For {recipientName}
                                </Typography>
                            )}
                        </View>
                        <Typography variant="caption" color={colors.textSecondary}>
                            #{order.id.slice(-6).toUpperCase()}
                        </Typography>
                    </View>

                    <View style={styles.priceList}>
                        <PriceRow label="Gift" value={formatCurrency(order.subtotal, currency)} />
                        <PriceRow label="Delivery" value={formatCurrency(order.deliveryFee, currency)} />
                        <PriceRow label="Packaging" value={formatCurrency(order.packagingFee, currency)} />
                        <View style={[styles.divider, { borderColor: colors.ink }]} />
                        <View style={styles.totalRow}>
                            <Typography variant="bodyBold">Total</Typography>
                            <Typography variant="h3" color={colors.primary}>
                                {formatCurrency(order.total, currency)}
                            </Typography>
                        </View>
                    </View>

                    {canPay ? (
                        <Button
                            title={`Make payment · ${formatCurrency(order.total, currency)}`}
                            onPress={onPay}
                            leftIcon={<HugeiconsIcon icon={CreditCardIcon} size={moderateScale(19)} color="#17151D" />}
                        />
                    ) : (
                        <View style={[styles.paymentState, { backgroundColor: hasPaid ? colors.mint : colors.surfaceRaised }]}>
                            <Typography variant="label" color={hasPaid ? colors.success : colors.textSecondary}>
                                {hasPaid ? 'Payment complete' : 'Payment is not available'}
                            </Typography>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

function PriceRow({ label, value }: { label: string; value: string }) {
    const { colors } = useTheme();

    return (
        <View style={styles.priceRow}>
            <Typography variant="label" color={colors.textSecondary}>{label}</Typography>
            <Typography variant="label">{value}</Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        maxWidth: moderateScale(520),
        borderWidth: 1.5,
        borderRadius: moderateScale(22),
        overflow: 'hidden',
    },
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(12),
        padding: moderateScale(14),
    },
    iconBox: {
        width: moderateScale(44),
        height: moderateScale(44),
        borderWidth: 1.5,
        borderRadius: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-3deg' }],
    },
    headingCopy: {
        flex: 1,
    },
    overline: {
        fontFamily: 'DMSans_700Bold',
        letterSpacing: moderateScale(0.7),
    },
    body: {
        gap: moderateScale(15),
        padding: moderateScale(16),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: moderateScale(12),
    },
    summaryCopy: {
        flex: 1,
    },
    priceList: {
        gap: moderateScale(8),
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: moderateScale(12),
    },
    divider: {
        borderTopWidth: 1.5,
        borderStyle: 'dashed',
        marginVertical: moderateScale(2),
    },
    totalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: moderateScale(12),
    },
    paymentState: {
        minHeight: moderateScale(48),
        borderRadius: moderateScale(16),
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: moderateScale(16),
    },
});
