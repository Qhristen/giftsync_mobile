import TransactionListSkeleton from '@/components/skeletons/TransactionListSkeleton';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetTransactionsQuery, useGetWalletBalanceQuery } from '@/store/api/walletApi';
import { WalletTransaction } from '@/types';
import { formatDateString, formatTime } from '@/utils/dateUtils';
import { formatCurrency } from '@/utils/formatCurrency';
import { moderateScale } from '@/utils/scaling';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowDown01Icon,
    ArrowLeft01Icon,
    ArrowUp01Icon,
    Coins02Icon,
    Invoice01Icon,
    RefreshIcon
} from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const TX_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
    purchase: { icon: ArrowDown01Icon, color: '#10B981', bg: '#10B98115' },
    deposit: { icon: ArrowDown01Icon, color: '#10B981', bg: '#10B98115' },
    referral_bonus: { icon: ArrowDown01Icon, color: '#10B981', bg: '#10B98115' },
    spend: { icon: ArrowUp01Icon, color: '#EF4444', bg: '#EF444415' },
    withdrawal: { icon: ArrowUp01Icon, color: '#EF4444', bg: '#EF444415' },
    refund: { icon: RefreshIcon, color: '#3B82F6', bg: '#3B82F615' },
};

const getTxStyle = (type: string) => TX_ICONS[type] || TX_ICONS.spend;

export default function WalletTransactionsScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data: wallet, refetch: refetchWallet, isLoading: isLoadingWallet } = useGetWalletBalanceQuery();
    const { data: txData, isLoading, isFetching, refetch } = useGetTransactionsQuery({ page, limit });

    const transactions = txData?.items ?? [];
    const meta = txData?.meta;
    const hasMore = meta ? page < meta.totalPages : false;


 
    const groupedTransactions = useMemo(() => {
        const groups: { title: string; data: WalletTransaction[] }[] = [];
        const map = new Map<string, WalletTransaction[]>();

        transactions.forEach(tx => {
            const dateStr = formatDateString(tx.createdAt);
            if (!map.has(dateStr)) {
                map.set(dateStr, []);
                groups.push({ title: dateStr, data: map.get(dateStr)! });
            }
            map.get(dateStr)!.push(tx);
        });

        return groups;
    }, [transactions]);

    const renderTransaction = ({ item, index }: { item: WalletTransaction; index: number }) => {
        const style = getTxStyle(item.type);
        const isCredit = item.type === 'purchase' || item.type === 'deposit' || item.type === 'refund' || item.type === 'referral_bonus';

        const amountText = item.paymentMethod === 'coins' || item?.reference?.startsWith('DEPOSIT')
            ? `${Math.abs(item.coinAmount || 0).toLocaleString()} Coins`
            : item?.reference?.startsWith('ORDER')
                ? formatCurrency(Math.abs(item.amount), 'NGN')
                : `${Math.abs(item.coinAmount || 0).toLocaleString()} Coins`;

        const balanceText = item.paymentMethod !== 'paystack' || item?.reference?.startsWith('DEPOSIT')
            ? `Bal: ${item.coinBalanceAfter?.toLocaleString()} Coins`
            : `Direct payment`;

        return (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
                <Card style={[styles.txCard, { backgroundColor: colors.surface, marginHorizontal: spacing.xl }]}>
                    <View style={[styles.txIcon, { backgroundColor: style.bg }]}>
                        <HugeiconsIcon icon={style.icon} size={22} color={style.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Typography variant="bodyBold" numberOfLines={1}>{item.description || item.type}</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>
                            {formatDateString(item.createdAt)} • {formatTime(item.createdAt)}
                        </Typography>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Typography
                            variant="bodyBold"
                            color={isCredit ? '#10B981' : '#EF4444'}
                        >
                            {isCredit ? '+' : '-'}{amountText}
                        </Typography>
                        <Typography variant="caption" color={colors.textMuted}>
                            {balanceText}
                        </Typography>
                    </View>
                </Card>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingBottom: spacing.md }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h3">Transaction History</Typography>
                <View style={{ width: 40 }} />
            </View>

            {/* Balance Summary */}
            <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
                <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <HugeiconsIcon icon={Coins02Icon} size={28} color="rgba(255,255,255,0.8)" />
                        <View>
                            <Typography variant="caption" color="rgba(255,255,255,0.7)" style={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: moderateScale(10) }}>
                                Current Balance
                            </Typography>
                            <Typography variant="h2" color="#FFF">
                                {wallet?.balance?.toLocaleString() ?? '—'} <Typography variant="body" color="rgba(255,255,255,0.8)">Coins</Typography>
                            </Typography>
                        </View>
                    </View>
                    {meta && (
                        <Typography variant="caption" color="rgba(255,255,255,0.6)" style={{ marginTop: 8 }}>
                            {meta.total} transaction{meta.total !== 1 ? 's' : ''} total
                        </Typography>
                    )}
                </Card>
            </Animated.View>

            {/* Transactions List */}
            {isLoading ? (
                <View style={{ flex: 1, paddingTop: 20 }}>
                    <TransactionListSkeleton />
                </View>
            ) : (
                <SectionList
                    sections={groupedTransactions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTransaction}
                    renderSectionHeader={({ section: { title } }) => (
                        <View style={[styles.sectionHeader, { backgroundColor: colors.background, paddingTop: spacing.md, paddingBottom: spacing.sm, paddingHorizontal: spacing.xl }]}>
                            <Typography variant="label" color={colors.textSecondary}>{title}</Typography>
                        </View>
                    )}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    onRefresh={() => { setPage(1); refetch(); refetchWallet(); }}
                    refreshing={(isFetching || isLoadingWallet) && page === 1}
                    onEndReached={() => {
                        if (hasMore && !isFetching) {
                            setPage(p => p + 1);
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', paddingTop: 60, gap: 12 }}>
                            <HugeiconsIcon icon={Invoice01Icon} size={48} color={colors.textMuted} style={{ opacity: 0.5 }} />
                            <Typography variant="body" color={colors.textSecondary} align="center">
                                No transactions yet.{'\n'}Your coin activity will appear here.
                            </Typography>
                        </View>
                    }
                    ListFooterComponent={
                        isFetching && page > 1 ? (
                            <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        ) : meta && transactions.length > 0 && !hasMore ? (
                            <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
                                <Typography variant="caption" color={colors.textMuted}>
                                    No more transactions to show
                                </Typography>
                            </View>
                        ) : null
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    balanceCard: {
        padding: 20,
        borderRadius: 24,
    },
    txCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
        marginBottom: 10,
    },
    txIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeader: {
        width: '100%',
    }
});
