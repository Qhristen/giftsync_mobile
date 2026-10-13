import Typography from '@/components/ui/Typography';
import PaperScreenHeader from '@/components/ui/PaperScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Mail01Icon, TelephoneIcon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function HelpCenterScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const faqs = [
        {
            category: 'Orders & Marketplace',
            questions: [
                {
                    q: 'How do I track my order?',
                    a: "Once a vendor ships your gift, you'll receive a notification with a tracking code. You can view this in the 'Orders' section of your profile."
                },
                {
                    q: 'What if my item is damaged?',
                    a: "If your item arrives damaged, do not confirm delivery. Instead, tap 'Dispute' on the order details page. Our team will review the case within 24-48 hours."
                }
            ]
        },
        {
            category: 'GiftSync Coins & Wallet',
            questions: [
                {
                    q: 'What are GiftSync Coins?',
                    a: 'Coins are our internal currency used for premium features like AI gift recommendations and exclusive digital perks.'
                },
                {
                    q: 'How do I top up my wallet?',
                    a: "Go to your Wallet screen and tap 'Buy Coins'. We support various payment methods including cards and bank transfers via secure gateways."
                }
            ]
        },
        {
            category: 'AI Features',
            questions: [
                {
                    q: 'How do gift recommendations work?',
                    a: "Our AI analyzes your contact's upcoming occasions and suggests the perfect gifts based on current trends and available marketplace inventory."
                }
            ]
        }
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <PaperScreenHeader eyebrow="Support switchboard" title="Let’s untangle it" onBack={() => router.back()} accent={colors.mint} />

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInUp.duration(400)}>
                    <View style={[styles.statusCard, { backgroundColor: colors.mint, borderColor: colors.ink, shadowColor: colors.ink }]}>
                        <View style={[styles.statusDot, { backgroundColor: colors.lime, borderColor: colors.ink }]} />
                        <View style={{ flex: 1 }}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>HUMANS ARE ONLINE</Typography>
                            <Typography variant="h3">Start with a quick answer.</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Or use the contact card below when it needs a real person.</Typography>
                        </View>
                    </View>

                    {faqs.map((category, cIdx) => (
                        <View key={cIdx} style={styles.categorySection}>
                            <Typography variant="caption" color={colors.textSecondary} style={[styles.overline, { marginBottom: 10 }]}>0{cIdx + 1} · {category.category.toUpperCase()}</Typography>
                            {category.questions.map((faq, fIdx) => (
                                <View key={fIdx} style={[styles.faqCard, { backgroundColor: [colors.lemon, colors.lavender, colors.peach][(cIdx + fIdx) % 3], borderColor: colors.ink, shadowColor: colors.ink, transform: [{ rotate: fIdx % 2 ? '0.4deg' : '-0.4deg' }] }]}>
                                    <View style={[styles.questionMark, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                        <Typography variant="bodyBold">?</Typography>
                                    </View>
                                    <Typography variant="bodyBold" style={{ marginBottom: 8 }}>{faq.q}</Typography>
                                    <Typography variant="body" color={colors.textSecondary} style={{ lineHeight: 22 }}>{faq.a}</Typography>
                                </View>
                            ))}
                        </View>
                    ))}

                    <View style={[styles.contactCard, { backgroundColor: colors.lilac, borderColor: colors.ink, shadowColor: colors.ink }]}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE HUMAN DESK</Typography>
                        <Typography variant="h3" style={{ marginBottom: 4 }}>Still need help?</Typography>
                        <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: 20 }}>Our support team is available 24/7 to assist you.</Typography>

                        <View style={styles.contactRow}>
                            <HugeiconsIcon icon={Mail01Icon} size={20} color={colors.ink} />
                            <Typography variant="bodyMedium">support@giftsync.app</Typography>
                        </View>

                        <View style={styles.contactRow}>
                            <HugeiconsIcon icon={TelephoneIcon} size={20} color={colors.ink} />
                            <Typography variant="bodyMedium">+234 (0) 800-GIFTSYNC</Typography>
                        </View>
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
    statusCard: { minHeight: 128, borderWidth: 1.5, borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 8, marginBottom: 28, shadowOffset: { width: 4, height: 5 }, shadowOpacity: 0.14, shadowRadius: 0 },
    statusDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5 },
    categorySection: {
        marginBottom: 32,
    },
    faqCard: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        marginBottom: 12,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 0,
    },
    questionMark: { position: 'absolute', top: -8, right: 13, width: 29, height: 29, borderRadius: 10, borderWidth: 1.25, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '5deg' }] },
    contactCard: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1.5,
        marginTop: 10,
        shadowOffset: { width: 4, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 0,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    }
});
