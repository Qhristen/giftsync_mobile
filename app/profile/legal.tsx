import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function LegalDocumentationScreen() {
    const { type } = useLocalSearchParams();
    const router = useRouter();
    const { colors, spacing } = useTheme();

    // Map parameterized content
    const getContent = () => {
        switch (type) {
            case 'terms':
                return {
                    title: 'Terms & Conditions',
                    date: 'Last updated: March 2026',
                    body: "Welcome to GiftSync.\n\nBy accessing or using our mobile application, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.\n\n1. Accounts\nWhen you create an account with us, you must provide accurate info. Failure to do so constitutes a breach of the Terms.\n\n2. Marketplace Transactions\nGiftSync provides a platform to connect buyers with vendors. The platform uses a secure escrow holding system.\n\n3. Wallets and Coins\nCoins are a virtual currency utilized within the ecosystem to govern premium functionality such as Artificial Intelligence generation and other digital perks.",
                };
            case 'privacy':
                return {
                    title: 'Privacy Policy',
                    date: 'Effective Date: March 2026',
                    body: "Your privacy is critically important to us.\n\n1. Data We Collect\nWe rely on secure authentication via Google and sync your contact calendar to help manage your occasions. The data stored locally or via our secure webhooks are encrypted.\n\n2. AI Processing\nGift recommendations are uniquely generated through anonymized vectors. None of your explicit identifying personal contacts are permanently stored alongside LLM endpoints.\n\n3. Deletion\nYou have the complete right to purge your account and database history at any time through the Profile settings.",
                };
            case 'help':
            default:
                return {
                    title: 'GiftSync Help Center',
                    date: 'Support Team Online',
                    body: "Need help? We've got you covered.\n\n1. Having trouble with a Marketplace Order?\nAll vendors must strictly upload valid dispatch codes. If you haven't received yours, tap 'Dispute' inside your order details page.\n\n2. How do I top-up my local wallet?\nYou can find the Top-Up prompt directly alongside your live coin balance. Tap it, pick a suitable package, and instantly secure your coins!\n\nEmail Us: support@giftsync.com\nCall: +234 (0) 800-GIFTSYNC",
                };
        }
    };

    const doc = getContent();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingBottom: spacing.md }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInUp.duration(400)}>
                    <Typography variant="h1" style={{ marginBottom: 8 }}>{doc.title}</Typography>
                    <Typography variant="label" color={colors.primary} style={{ marginBottom: spacing.xl }}>{doc.date}</Typography>

                    <View style={[styles.documentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Typography variant="body" color={colors.textSecondary} style={{ lineHeight: 28 }}>
                            {doc.body}
                        </Typography>
                    </View>
                </Animated.View>
            </ScrollView>
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
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    documentCard: {
        padding: 24,
        borderRadius: 24,
        // borderWidth: 1,
    },
});
