import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function TermsAndConditionsScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const sections = [
        {
            title: '1. Agreement to Terms',
            content: 'By accessing or using GiftSync, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our services.'
        },
        {
            title: '2. Eligibility',
            content: 'You must be at least 18 years old or the age of majority in your jurisdiction to use GiftSync. By using the app, you represent that you have the legal capacity to enter into a binding agreement.'
        },
        {
            title: '3. User Accounts',
            content: 'To access certain features, you must create an account via Google Authentication. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.'
        },
        {
            title: '4. Marketplace & Transactions',
            content: 'GiftSync provides a platform connecting buyers with third-party vendors. We facilitate transactions through a secure escrow system. Once an order is placed, funds are held until delivery is confirmed or the dispute period expires.'
        },
        {
            title: '5. Wallet & GiftSync Coins',
            content: 'GiftSync Coins are virtual credits used within the app for premium services, including AI-powered gift recommendations and digital perks. Coins are non-refundable and cannot be exchanged for cash outside the GiftSync ecosystem.'
        },
        {
            title: '6. AI-Powered Services',
            content: 'Our gift recommendation engine uses Artificial Intelligence to suggest products based on your contacts and preferences. While we strive for accuracy, recommendations are provided "as is" without guarantees of suitability.'
        },
        {
            title: '7. Prohibited Conduct',
            content: 'You agree not to: (a) use the service for any illegal purpose; (b) attempt to gain unauthorized access to our systems; (c) interfere with other users\' enjoyment of the service; (d) post fraudulent or misleading content.'
        },
        {
            title: '8. Limitation of Liability',
            content: 'GiftSync shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services, or for the cost of procurement of substitute goods.'
        },
        {
            title: '9. Governing Law',
            content: 'These terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions.'
        }
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingBottom: spacing.md }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView 
                contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }} 
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInUp.duration(400)}>
                    <Typography variant="h1" style={{ marginBottom: 8 }}>Terms & Conditions</Typography>
                    <Typography variant="label" color={colors.primary} style={{ marginBottom: spacing.xl }}>Last updated: May 2026</Typography>

                    {sections.map((section, index) => (
                        <View key={index} style={styles.section}>
                            <Typography variant="h3" style={{ marginBottom: 12 }}>{section.title}</Typography>
                            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Typography variant="body" color={colors.textSecondary} style={{ lineHeight: 24 }}>
                                    {section.content}
                                </Typography>
                            </View>
                        </View>
                    ))}

                    <View style={[styles.footer, { marginTop: spacing.xl }]}>
                        <Typography variant="caption" color={colors.textMuted} align="center">
                            Questions about our Terms? Contact us at legal@giftsync.app
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
    section: {
        marginBottom: 32,
    },
    card: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
    },
    footer: {
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f033',
    }
});
