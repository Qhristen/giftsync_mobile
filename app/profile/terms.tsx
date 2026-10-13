import Typography from '@/components/ui/Typography';
import PaperScreenHeader from '@/components/ui/PaperScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
            <PaperScreenHeader eyebrow="The agreement folio" title="Terms, in plain sight" onBack={() => router.back()} accent={colors.lemon} />

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInUp.duration(400)}>
                    <View style={[styles.cover, { backgroundColor: colors.lemon, borderColor: colors.ink, shadowColor: colors.ink }]}>
                        <View style={[styles.binding, { backgroundColor: colors.lilac, borderColor: colors.ink }]} />
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>GIFTSYNC · AGREEMENT FILE</Typography>
                        <Typography variant="h1">The good-faith rules</Typography>
                        <Typography variant="body" color={colors.textSecondary}>How we keep gifting, buying, selling, and recommendations fair.</Typography>
                        <View style={[styles.updatedStamp, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                            <Typography variant="caption" style={styles.overline}>UPDATED · MAY 2026</Typography>
                        </View>
                    </View>

                    {sections.map((section, index) => (
                        <View key={index} style={styles.section}>
                            <View style={styles.sectionHeading}>
                                <View style={[styles.numberTab, { backgroundColor: [colors.mint, colors.peach, colors.lavender][index % 3], borderColor: colors.ink }]}>
                                    <Typography variant="caption" style={styles.overline}>{String(index + 1).padStart(2, '0')}</Typography>
                                </View>
                                <Typography variant="h3" style={{ flex: 1 }}>{section.title.replace(/^\d+\.\s*/, '')}</Typography>
                            </View>
                            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.ink, shadowColor: [colors.mint, colors.peach, colors.lavender][index % 3] }]}>
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
    },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 0.9 },
    cover: { padding: 22, borderWidth: 1.5, borderRadius: 25, gap: 7, marginTop: 8, marginBottom: 30, shadowOffset: { width: 5, height: 6 }, shadowOpacity: 0.15, shadowRadius: 0, transform: [{ rotate: '-0.6deg' }] },
    binding: { position: 'absolute', left: 13, top: -8, width: 72, height: 17, borderWidth: 1, transform: [{ rotate: '-3deg' }] },
    updatedStamp: { alignSelf: 'flex-start', borderWidth: 1.25, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 6, marginTop: 8, transform: [{ rotate: '2deg' }] },
    section: {
        marginBottom: 24,
    },
    sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
    numberTab: { width: 42, height: 34, borderWidth: 1.25, borderRadius: 11, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-3deg' }] },
    card: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1.5,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    footer: {
        paddingVertical: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f033',
    }
});
