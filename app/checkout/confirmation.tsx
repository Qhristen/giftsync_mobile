import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import CheckoutSkeleton from '@/components/skeletons/CheckoutSkeleton';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetOrderByIdQuery } from '@/store/api/orderApi';
import { Calendar01Icon, DeliveryTruck02Icon, GiftIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ConfirmationScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const { data: order, isLoading } = useGetOrderByIdQuery(orderId as string, { skip: !orderId });

    if (isLoading) {
        return <CheckoutSkeleton step={4} />;
    }

    const deliveryDate = order?.deliveryDate
        ? new Date(order.deliveryDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
        : 'Being scheduled';

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.confetti, styles.confettiOne, { backgroundColor: colors.lime, borderColor: colors.ink }]} />
            <View style={[styles.confetti, styles.confettiTwo, { backgroundColor: colors.peach, borderColor: colors.ink }]} />
            <View style={[styles.confetti, styles.confettiThree, { backgroundColor: colors.sky, borderColor: colors.ink }]} />

            <CheckoutProgress step={4} eyebrow="All wrapped up" title="Gift dispatched!" />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View

                    style={[styles.launchCard, { backgroundColor: colors.mint, borderColor: colors.ink }]}
                >
                    <View style={[styles.tape, { backgroundColor: colors.lilac, borderColor: colors.ink }]} />
                    <View style={[styles.successSeal, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={Tick01Icon} size={56} color={colors.ink} />
                    </View>
                    <Typography variant="h1" align="center">It&apos;s officially on!</Typography>
                    <Typography variant="body" align="center" color={colors.textSecondary} style={styles.heroMessage}>
                        We&apos;re preparing {order?.item?.product?.name || 'your custom gift request'} for {order?.recipientName || 'someone special'} now.
                    </Typography>
                    <View style={[styles.sentBadge, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={GiftIcon} size={17} color={colors.ink} />
                        <Typography variant="caption" style={styles.badgeCopy}>ORDER ACCEPTED · #{order?.id?.slice(-6).toUpperCase()}</Typography>
                    </View>
                </View>

                <View style={styles.sectionHeading}>
                    <Typography variant="label">Your dispatch ticket</Typography>
                    <Typography variant="caption" color={colors.textSecondary}>KEEP THIS HANDY</Typography>
                </View>

                <View

                    style={[styles.dispatchTicket, { backgroundColor: colors.surface, borderColor: colors.ink }]}
                >
                    <View style={styles.ticketRow}>
                        <View style={[styles.ticketIcon, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={DeliveryTruck02Icon} size={24} color={colors.ink} />
                        </View>
                        <View style={styles.ticketCopy}>
                            <Typography variant="caption" color={colors.textSecondary}>DESTINATION</Typography>
                            <Typography variant="bodyBold">{order?.recipientName || 'Your recipient'}</Typography>
                            <Typography variant="caption" color={colors.textSecondary} numberOfLines={2}>
                                {order?.deliveryAddress
                                    ? `${order.deliveryAddress.line1}, ${order.deliveryAddress.city}`
                                    : 'Delivery address confirmed'}
                            </Typography>
                        </View>
                    </View>

                    <View style={[styles.perforation, { borderColor: colors.textMuted }]}>
                        <View style={[styles.ticketNotch, styles.leftNotch, { backgroundColor: colors.background, borderColor: colors.ink }]} />
                        <View style={[styles.ticketNotch, styles.rightNotch, { backgroundColor: colors.background, borderColor: colors.ink }]} />
                    </View>

                    <View style={styles.detailsGrid}>
                        <TicketFact icon={Calendar01Icon} label="DROP DATE" value={deliveryDate} color={colors.sky} />
                        <TicketFact icon={DeliveryTruck02Icon} label="WINDOW" value={order?.deliveryTimeWindow || 'To be confirmed'} color={colors.peach} />
                    </View>
                    <View style={styles.ticketFooter}>
                        <View>
                            <Typography variant="caption" color={colors.textSecondary}>CURRENT STATUS</Typography>
                            <Typography variant="bodyBold">{order?.status || 'Processing'}</Typography>
                        </View>
                        <View style={[styles.processingStamp, { backgroundColor: colors.lavender, borderColor: colors.ink }]}>
                            <Typography variant="caption" style={styles.badgeCopy}>PREPARING WITH CARE</Typography>
                        </View>
                    </View>
                </View>

                <View

                    style={[styles.nextNote, { backgroundColor: colors.lemon, borderColor: colors.ink }]}
                >
                    <Typography variant="bodyBold">What happens next?</Typography>
                    <Typography variant="caption" color={colors.textSecondary}>
                        We&apos;ll keep the order timeline updated from preparation to doorstep. You can check it whenever you like.
                    </Typography>
                </View>
            </ScrollView>

            <View

                style={[styles.actions, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}
            >
                <Button title="Follow the gift  →" onPress={() => router.replace('/orders')} style={styles.actionButton} />
                <Button title="Back to gift desk" variant="outline" onPress={() => router.replace('/(tabs)')} style={styles.actionButton} />
            </View>
        </View>
    );
}

function TicketFact({ icon, label, value, color }: {
    icon: typeof Calendar01Icon;
    label: string;
    value: string;
    color: string;
}) {
    const { colors } = useTheme();
    return (
        <View style={[styles.factCard, { backgroundColor: color, borderColor: colors.ink }]}>
            <HugeiconsIcon icon={icon} size={20} color={colors.ink} />
            <Typography variant="caption" color={colors.textSecondary}>{label}</Typography>
            <Typography variant="bodyBold" numberOfLines={2}>{value}</Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 190, gap: 18 },
    confetti: { position: 'absolute', width: 16, height: 38, borderWidth: 1.5, zIndex: 2 },
    confettiOne: { top: 128, left: 13, transform: [{ rotate: '-24deg' }] },
    confettiTwo: { top: 205, right: 12, width: 25, height: 15, transform: [{ rotate: '18deg' }] },
    confettiThree: { top: 85, right: 54, width: 12, height: 28, transform: [{ rotate: '36deg' }] },
    launchCard: {
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingVertical: 27,
        gap: 10,

        transform: [{ rotate: '-0.6deg' }],
    },
    tape: {
        position: 'absolute',
        top: -10,
        width: 70,
        height: 21,
        borderWidth: 1,
        opacity: 0.88,
        transform: [{ rotate: '3deg' }],
    },
    successSeal: {
        width: 94,
        height: 94,
        borderRadius: 47,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
        transform: [{ rotate: '-5deg' }],
    },
    heroMessage: { maxWidth: 310 },
    sentBadge: { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7, marginTop: 5 },
    badgeCopy: { fontWeight: '800' },
    sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    dispatchTicket: {
        borderWidth: 1.5,
        borderRadius: 23,
        padding: 18,
        gap: 16,

        transform: [{ rotate: '0.5deg' }],
    },
    ticketRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    ticketIcon: { width: 50, height: 50, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    ticketCopy: { flex: 1 },
    perforation: { borderTopWidth: 1, borderStyle: 'dashed', marginHorizontal: -18 },
    ticketNotch: { position: 'absolute', top: -11, width: 20, height: 20, borderRadius: 10, borderWidth: 1.5 },
    leftNotch: { left: -11 },
    rightNotch: { right: -11 },
    detailsGrid: { flexDirection: 'row', gap: 11 },
    factCard: { flex: 1, borderWidth: 1.5, borderRadius: 18, padding: 13, gap: 5, justifyContent: 'center' },
    ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
    processingStamp: { borderWidth: 1.5, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 6, transform: [{ rotate: '-2deg' }] },
    nextNote: { borderWidth: 1.5, borderRadius: 19, padding: 15, gap: 4, transform: [{ rotate: '-0.4deg' }] },
    actions: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 14, gap: 10 },
    actionButton: { width: '100%' },
});
