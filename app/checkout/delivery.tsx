import ConfirmDeleteSheet from '@/components/sheets/ConfirmDeleteSheet';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { setDeliveryDetails } from '@/store/slices/checkoutSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function DeliveryScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, spacing } = useTheme();
    const checkout = useSelector((state: RootState) => state.checkout);

    const addressSheet = useBottomSheet();
    const messageSheet = useBottomSheet();

    const handleNext = () => {
        router.push('/checkout/payment');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { padding: spacing.xl, paddingBottom: spacing.md }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h2">Delivery Details</Typography>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { padding: spacing.xl }]}>
                {/* Recipient Address */}
                <Typography variant="label" style={{ marginBottom: spacing.sm }}>Recipient Address</Typography>
                <Card variant="outline" style={styles.addressCard}>
                    <View style={styles.addressInfo}>
                        <Typography variant="bodyBold">Alex Johnson</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>
                            123 Victoria Island, Lagos State, Nigeria. +234 810 000 0000
                        </Typography>
                    </View>
                    <Button title="Change" size="sm" variant="ghost" onPress={() => addressSheet.open()} />
                </Card>

                {/* Delivery Options */}
                <Typography variant="label" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Delivery Preference</Typography>
                <Card variant="outline" style={styles.optionsCard}>
                    <View style={styles.optionRow}>
                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        <Typography variant="body" style={{ flex: 1 }}>Delivery Date</Typography>
                        <Typography variant="bodyBold" color={colors.primary}>March 25, 2026</Typography>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.optionRow}>
                        <Ionicons name="time-outline" size={20} color={colors.primary} />
                        <Typography variant="body" style={{ flex: 1 }}>Time Window</Typography>
                        <Typography variant="bodyBold" color={colors.primary}>Afternoon</Typography>
                    </View>
                </Card>

                {/* Premium Packaging */}
                <Card variant="raised" style={[styles.packagingCard, { marginTop: spacing.xl }]}>
                    <View style={{ flex: 1 }}>
                        <Typography variant="bodyBold">Premium Packaging</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>Ribbon-wrapped box + Silk paper (+ NGN 500)</Typography>
                    </View>
                    <Switch
                        value={checkout.includesPremiumPackaging}
                        onValueChange={(val) => dispatch(setDeliveryDetails({ includesPremiumPackaging: val }))}
                        trackColor={{ false: colors.border, true: colors.primary }}
                    />
                </Card>

                {/* Gift Message */}
                <Typography variant="label" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Personal Message</Typography>
                <Card variant="outline" onPress={() => messageSheet.open()} style={styles.messageCard}>
                    {checkout.giftMessage ? (
                        <Typography variant="body" color={colors.textPrimary}>{checkout.giftMessage}</Typography>
                    ) : (
                        <Typography variant="body" color={colors.textMuted}>Add a heartfelt message for Alex...</Typography>
                    )}
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                </Card>

                {/* Summary Mini */}
                <Card variant="raised" style={{ marginTop: 40, padding: 16 }}>
                    <View style={styles.summaryRow}>
                        <Typography variant="caption">Item Subtotal</Typography>
                        <Typography variant="caption">NGN 12,500</Typography>
                    </View>
                    <View style={styles.summaryRow}>
                        <Typography variant="caption">Delivery Fee</Typography>
                        <Typography variant="caption">NGN 1,500</Typography>
                    </View>
                    {checkout.includesPremiumPackaging && (
                        <View style={styles.summaryRow}>
                            <Typography variant="caption">Packaging</Typography>
                            <Typography variant="caption">NGN 500</Typography>
                        </View>
                    )}
                    <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 8 }]} />
                    <View style={styles.summaryRow}>
                        <Typography variant="bodyBold">Estimated Total</Typography>
                        <Typography variant="bodyBold" color={colors.primary}>NGN {14000 + (checkout.includesPremiumPackaging ? 500 : 0)}</Typography>
                    </View>
                </Card>
            </ScrollView>

            {/* Footer CTA */}
            <View style={[styles.footer, { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Button
                    title="Continue to Payment →"
                    onPress={handleNext}
                    style={styles.submitBtn}
                />
            </View>

            {/* Sheet Placeholders */}
            <ConfirmDeleteSheet
                ref={addressSheet.ref}
                title="Change Address"
                description="Select a different delivery address for this recipient."
                onConfirm={() => addressSheet.close()}
            />
            <ConfirmDeleteSheet
                ref={messageSheet.ref}
                title="Gift Message"
                description="Type your custom gift message here."
                onConfirm={() => messageSheet.close()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backBtn: {
        padding: 8,
    },
    content: {
        flexGrow: 1,
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    addressInfo: {
        flex: 1,
    },
    optionsCard: {
        padding: 0,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.1,
    },
    packagingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    messageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        minHeight: 80,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    footer: {
        width: '100%',
    },
    submitBtn: {
        width: '100%',
    },
});
