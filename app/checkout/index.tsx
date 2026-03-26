import ContactPickerSheet from '@/components/sheets/ContactPickerSheet';
import OccasionPickerSheet from '@/components/sheets/OccasionPickerSheet';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

export default function CheckoutEntry() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { colors, spacing } = useTheme();
    const params = useLocalSearchParams();
    const checkout = useSelector((state: RootState) => state.checkout);

    const contactSheet = useBottomSheet();
    const occasionSheet = useBottomSheet();

    const handleNext = () => {
        router.push('/checkout/delivery');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { padding: spacing.xl, paddingBottom: spacing.md }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h2">Confirm Your Gift</Typography>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { padding: spacing.xl }]}>
                {/* Recipient Card */}
                <Typography variant="label" style={{ marginBottom: spacing.sm }}>Recipient & Occasion</Typography>
                <Card variant="outline" style={styles.contextCard}>
                    <View style={styles.contextRow}>
                        <Avatar name="Alex Johnson" size="lg" />
                        <View style={{ flex: 1 }}>
                            <Typography variant="bodyBold">Alex Johnson</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Partner</Typography>
                        </View>
                        <Button title="Edit" size="sm" variant="ghost" onPress={() => contactSheet.open()} />
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.contextRow}>
                        <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                        <View style={{ flex: 1 }}>
                            <Typography variant="bodyMedium">Birthday</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>March 25, 2026</Typography>
                        </View>
                        <Button title="Edit" size="sm" variant="ghost" onPress={() => occasionSheet.open()} />
                    </View>
                </Card>

                {/* Gift Card */}
                <Typography variant="label" style={{ marginTop: spacing.xl, marginBottom: spacing.sm }}>Selected Gift</Typography>
                <Card variant="outline" style={styles.giftCard}>
                    <View style={styles.giftImagePlaceholder} />
                    <View style={{ flex: 1 }}>
                        <Typography variant="bodyBold">Premium Leather Wallet</Typography>
                        <Typography variant="caption" color={colors.textSecondary}>Color: Brown</Typography>
                        <Typography variant="label" color={colors.primary} style={{ marginTop: 4 }}>NGN 12,500</Typography>
                    </View>
                    <Button title="Change" size="sm" variant="ghost" onPress={() => router.push('/(tabs)/shop')} />
                </Card>
            </ScrollView>

            {/* Footer CTA */}
            <View style={[styles.footer, { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Button
                    title="Looks good, Continue →"
                    onPress={handleNext}
                    style={styles.submitBtn}
                />
            </View>

            {/* Sheets */}
            <ContactPickerSheet
                ref={contactSheet.ref}
                contacts={[]}
                onSelect={() => contactSheet.close()}
            />
            <OccasionPickerSheet
                ref={occasionSheet.ref}
                occasions={[]}
                onSelect={() => occasionSheet.close()}
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
    contextCard: {
        padding: 16,
        gap: 16,
    },
    contextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    divider: {
        height: 1,
        width: '100%',
        opacity: 0.1,
    },
    giftCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    giftImagePlaceholder: {
        width: 60,
        height: 60,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
    },
    footer: {
        width: '100%',
    },
    submitBtn: {
        width: '100%',
    },
});
