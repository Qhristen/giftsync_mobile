import { useTheme } from '@/hooks/useTheme';
import { WalletTransaction } from '@/types';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    ArrowDown01Icon,
    ArrowUp01Icon,
    Coins02Icon,
    RefreshIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Typography from '../ui/Typography';
import { moderateScale } from '@/utils/scaling';

interface TransactionDetailSheetProps {
    transaction: WalletTransaction | null;
    onClose?: () => void;
}

const CREDIT_TYPES = new Set<WalletTransaction['type']>(['purchase', 'deposit', 'refund', 'referral_bonus']);

const TRANSACTION_ICONS: Record<WalletTransaction['type'], typeof ArrowDown01Icon> = {
    purchase: ArrowDown01Icon,
    deposit: ArrowDown01Icon,
    referral_bonus: ArrowDown01Icon,
    spend: ArrowUp01Icon,
    withdrawal: ArrowUp01Icon,
    refund: RefreshIcon,
};

const titleCase = (value: string) => value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const TransactionDetailSheet = forwardRef<BottomSheetRef, TransactionDetailSheetProps>(({
    transaction,
    onClose,
}, ref) => {
    const { colors } = useTheme();

    if (!transaction) {
        return (
            <BottomSheetWrapper ref={ref} snapPoints={['45%']} onClose={onClose}>
                <View style={styles.emptyState}>
                    <Typography variant="body" color={colors.textSecondary}>Select a transaction to see its details.</Typography>
                </View>
            </BottomSheetWrapper>
        );
    }

    const isCredit = CREDIT_TYPES.has(transaction.type);
    const isDirectOrderPayment = transaction.paymentMethod !== 'coins'
        && transaction.reference?.startsWith('ORDER');
    const usesCoins = transaction.paymentMethod === 'coins'
        || transaction.reference?.startsWith('DEPOSIT');
    const coinAmount = Math.abs(transaction.coinAmount || 0);
    const cashAmount = Math.abs(transaction.amount || 0);
    const displayAmount = usesCoins
        ? `${coinAmount.toLocaleString()} coins`
        : formatCurrency(cashAmount, 'NGN');
    const normalizedStatus = transaction.status?.toLowerCase() || 'unknown';
    const statusColor = ['success', 'successful', 'completed', 'paid'].includes(normalizedStatus)
        ? colors.mint
        : ['failed', 'cancelled', 'declined'].includes(normalizedStatus)
            ? colors.peach
            : colors.lemon;
    const TransactionIcon = TRANSACTION_ICONS[transaction.type];

    return (
        <BottomSheetWrapper ref={ref} snapPoints={['76%']} scrollable onClose={onClose}>
            <View style={styles.content}>
                <View style={styles.headingRow}>
                    <View style={{ flex: 1 }}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>TRANSACTION RECEIPT</Typography>
                        <Typography variant="h2">Ledger details</Typography>
                    </View>
                    <View style={[styles.statusStamp, { backgroundColor: statusColor, borderColor: colors.ink }]}>
                        <Typography variant="caption" style={styles.overline}>{transaction.status?.toUpperCase() || 'UNKNOWN'}</Typography>
                    </View>
                </View>

                <View style={[styles.amountCard, { backgroundColor: isCredit ? colors.mint : colors.peach, borderColor: colors.ink }]}>
                    <View style={[styles.amountIcon, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={TransactionIcon} size={moderateScale(27)} color={colors.ink} />
                    </View>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>
                        {titleCase(transaction.type)}
                    </Typography>
                    <Typography variant="h1" color={isCredit ? colors.success : colors.error}>
                        {isCredit ? '+' : '−'}{displayAmount}
                    </Typography>
                    <Typography variant="body" align="center" color={colors.textSecondary}>
                        {transaction.description || 'GiftSync wallet transaction'}
                    </Typography>
                </View>

                <View style={[styles.receipt, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                    <DetailRow label="Reference" value={transaction.reference || 'Not available'} />
                    <DetailRow label="Transaction ID" value={transaction.id} />
                    <DetailRow label="Date" value={formatDate(transaction.createdAt, 'MMMM d, yyyy')} />
                    <DetailRow label="Time" value={formatTime(transaction.createdAt)} />
                    <View style={[styles.divider, { borderColor: colors.textMuted }]} />
                    <DetailRow label="Payment method" value={titleCase(transaction.paymentMethod || 'Not available')} />
                    <DetailRow label="Category" value={titleCase(transaction.type)} />
                    <DetailRow label="Cash value" value={formatCurrency(cashAmount, 'NGN')} />
                    {transaction.coinAmount !== undefined && (
                        <DetailRow label="Coin amount" value={`${coinAmount.toLocaleString()} coins`} />
                    )}
                    {!isDirectOrderPayment && (
                        <DetailRow label="Balance after" value={`${transaction.coinBalanceAfter?.toLocaleString() ?? '—'} coins`} />
                    )}
                </View>

                <View style={[styles.note, { backgroundColor: colors.lavender, borderColor: colors.ink }]}>
                    <HugeiconsIcon icon={Coins02Icon} size={moderateScale(20)} color={colors.ink} />
                    <View style={{ flex: 1 }}>
                        <Typography variant="bodyBold">Receipt saved in your ledger</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>Use the reference above if you need help with this transaction.</Typography>
                    </View>
                </View>
            </View>
        </BottomSheetWrapper>
    );
});

TransactionDetailSheet.displayName = 'TransactionDetailSheet';

function DetailRow({ label, value }: { label: string; value: string }) {
    const { colors } = useTheme();

    return (
        <View style={styles.detailRow}>
            <Typography variant="body" color={colors.textSecondary} style={styles.detailLabel}>{label}</Typography>
            <Typography variant="bodyBold" align="right" style={styles.detailValue}>{value}</Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyState: { paddingVertical: moderateScale(40), alignItems: 'center' },
    content: { paddingTop: moderateScale(6), paddingBottom: moderateScale(28), gap: moderateScale(18) },
    headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: moderateScale(12) },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(0.8) },
    statusStamp: { borderWidth: 1.5, borderRadius: moderateScale(10), paddingHorizontal: moderateScale(10), paddingVertical: moderateScale(7), transform: [{ rotate: '2deg' }] },
    amountCard: { alignItems: 'center', borderWidth: 1.5, borderRadius: moderateScale(23), padding: moderateScale(20), gap: moderateScale(5), transform: [{ rotate: '-0.4deg' }] },
    amountIcon: { width: moderateScale(54), height: moderateScale(54), borderRadius: moderateScale(17), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: moderateScale(4) },
    receipt: { borderWidth: 1.5, borderRadius: moderateScale(20), padding: moderateScale(17), gap: moderateScale(3) },
    detailRow: { minHeight: moderateScale(38), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: moderateScale(14) },
    detailLabel: { flex: 0.8 },
    detailValue: { flex: 1.2 },
    divider: { borderTopWidth: 1, borderStyle: 'dashed', marginVertical: moderateScale(8) },
    note: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(11), borderWidth: 1.5, borderRadius: moderateScale(17), padding: moderateScale(14) },
});

export default TransactionDetailSheet;
