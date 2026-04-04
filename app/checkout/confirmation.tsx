import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetOrderByIdQuery } from '@/store/api/orderApi';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import Animated, { BounceIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ConfirmationScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const { data: order, isLoading } = useGetOrderByIdQuery(orderId as string, { skip: !orderId });

    const handleFinish = () => {
        router.replace('/(tabs)');
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.content, { padding: spacing.xl }]}>
                {/* Animated Success Icon */}
                <Animated.View entering={BounceIn.delay(300).duration(800)} style={styles.successIconBox}>
                    <View style={[styles.successCircle, { backgroundColor: colors.success + '20' }]}>
                        <Ionicons name="checkmark-circle" size={100} color={colors.success} />
                    </View>
                </Animated.View>

                {/* Success Message */}
                <Animated.View entering={FadeInUp.delay(600).duration(800)}>
                    <Typography variant="h1" align="center" style={styles.title}>
                        Order Placed! 🎁
                    </Typography>
                    <Typography variant="body" align="center" color={colors.textSecondary} style={styles.tagline}>
                        Your gift is on its way to {order?.recipientName || 'your recipient'}.
                    </Typography>
                </Animated.View>

                {/* Order Details Card */}
                <Animated.View entering={FadeInDown.delay(1000).duration(800)} style={styles.summaryCardBox}>
                    <Card variant="outline" style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Typography variant="caption" color={colors.textSecondary}>Order Number</Typography>
                            <Typography variant="bodyBold">#GS-{order?.id?.slice(-6).toUpperCase()}</Typography>
                        </View>
                        <View style={styles.summaryLine} />
                        <View style={styles.summaryRow}>
                            <Typography variant="caption" color={colors.textSecondary}>Delivery Date</Typography>
                            <Typography variant="bodyBold">
                                {order?.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '---'}
                            </Typography>
                        </View>
                        <View style={styles.summaryLine} />
                        <View style={styles.summaryRow}>
                            <Typography variant="caption" color={colors.textSecondary}>Status</Typography>
                            <Typography variant="bodyBold" color={colors.success}>{order?.status || 'Processing'}</Typography>
                        </View>
                    </Card>
                </Animated.View>

                {/* Actions */}
                <Animated.View entering={FadeInDown.delay(1200).duration(800)} style={styles.actionsBox}>
                    <Button title="Track Order" variant="primary" style={styles.actionBtn} onPress={() => router.push('/orders')} />
                    <Button title="Go Home" variant="ghost" style={styles.actionBtn} onPress={handleFinish} />
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: '100%',
        alignItems: 'center',
    },
    successIconBox: {
        marginBottom: 40,
    },
    successCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 36,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 18,
        marginBottom: 40,
    },
    summaryCardBox: {
        width: '100%',
        marginBottom: 40,
    },
    summaryCard: {
        padding: 24,
        gap: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
    },
    summaryLine: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        width: '100%',
    },
    actionsBox: {
        width: '100%',
        gap: 12,
    },
    actionBtn: {
        width: '100%',
    },
});
