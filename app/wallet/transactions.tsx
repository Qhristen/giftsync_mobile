import ListSkeleton from '@/components/skeletons/ListSkeleton';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetTransactionsQuery, useGetWalletBalanceQuery } from '@/store/api/walletApi';
import { WalletTransaction } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const TX_ICONS: Record<string, { name: string; color: string; bg: string }> = {
    purchase: { name: 'arrow-down-circle', color: '#10B981', bg: '#10B98115' },
    deposit: { name: 'arrow-down-circle', color: '#10B981', bg: '#10B98115' },
    spend: { name: 'arrow-up-circle', color: '#EF4444', bg: '#EF444415' },
    withdrawal: { name: 'arrow-up-circle', color: '#EF4444', bg: '#EF444415' },
    refund: { name: 'refresh-circle', color: '#3B82F6', bg: '#3B82F615' },
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

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

        return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    };

    const groupedTransactions = useMemo(() => {
        const groups: { title: string; data: WalletTransaction[] }[] = [];
        const map = new Map<string, WalletTransaction[]>();

        transactions.forEach(tx => {
            const dateStr = formatDate(tx.createdAt);
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
        const isCredit = item.type === 'purchase' || item.type === 'deposit' || item.type === 'refund';

        return (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
                <Card style={[styles.txCard, { backgroundColor: colors.surface, marginHorizontal: spacing.xl }]}>
                    <View style={[styles.txIcon, { backgroundColor: style.bg }]}>
                        <Ionicons name={style.name as React.ComponentProps<typeof Ionicons>['name']} size={22} color={style.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Typography variant="bodyBold" numberOfLines={1}>{item.description || item.type}</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>
                            {formatDate(item.createdAt)} • {formatTime(item.createdAt)}
                        </Typography>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Typography
                            variant="bodyBold"
                            color={isCredit ? '#10B981' : '#EF4444'}
                        >
                            {isCredit ? '+' : '-'}{item.paymentMethod === 'coins' ? `${Math.abs(item.amount).toLocaleString()} Coins` : formatCurrency(Math.abs(item.amount), 'NGN')}
                        </Typography>
                        <Typography variant="caption" color={colors.textMuted}>
                            {item.paymentMethod !== 'paystack' && `Bal: ${item.balanceAfter?.toLocaleString()} Coins`}
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
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h3">Transaction History</Typography>
                <View style={{ width: 40 }} />
            </View>

            {/* Balance Summary */}
            <Animated.View entering={FadeInDown.duration(400)} style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.lg }}>
                <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <FontAwesome5 name="coins" size={28} color="rgba(255,255,255,0.8)" />
                        <View>
                            <Typography variant="caption" color="rgba(255,255,255,0.7)" style={{ textTransform: 'uppercase', letterSpacing: 1, fontSize: 10 }}>
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
                    <ListSkeleton />
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
                            <Ionicons name="receipt-outline" size={48} color={colors.textMuted} style={{ opacity: 0.5 }} />
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
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
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
