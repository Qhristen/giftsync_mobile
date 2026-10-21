import Typography from '@/components/ui/Typography';
import PaperScreenHeader from '@/components/ui/PaperScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Mail01Icon, TelephoneIcon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { moderateScale } from '@/utils/scaling';export default function HelpCenterScreen() {
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
                contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: moderateScale(100) }}
                showsVerticalScrollIndicator={false}
            >
                <View>
                    <View style={[styles.statusCard, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                        <View style={[styles.statusDot, { backgroundColor: colors.lime, borderColor: colors.ink }]} />
                        <View style={{ flex: 1 }}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>HUMANS ARE ONLINE</Typography>
                            <Typography variant="h3">Start with a quick answer.</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Or use the contact card below when it needs a real person.</Typography>
                        </View>
                    </View>

                    {faqs.map((category, cIdx) => (
                        <View key={cIdx} style={styles.categorySection}>
                            <Typography variant="caption" color={colors.textSecondary} style={[styles.overline, { marginBottom: moderateScale(10) }]}>0{cIdx + 1} · {category.category.toUpperCase()}</Typography>
                            {category.questions.map((faq, fIdx) => (
                                <View key={fIdx} style={[styles.faqCard, { backgroundColor: [colors.lemon, colors.lavender, colors.peach][(cIdx + fIdx) % 3], borderColor: colors.ink, transform: [{ rotate: fIdx % 2 ? '0.4deg' : '-0.4deg' }] }]}>
                                    <View style={[styles.questionMark, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                        <Typography variant="bodyBold">?</Typography>
                                    </View>
                                    <Typography variant="bodyBold" style={{ marginBottom: moderateScale(8) }}>{faq.q}</Typography>
                                    <Typography variant="body" color={colors.textSecondary} style={{ lineHeight: moderateScale(22) }}>{faq.a}</Typography>
                                </View>
                            ))}
                        </View>
                    ))}

                    <View style={[styles.contactCard, { backgroundColor: colors.lilac, borderColor: colors.ink }]}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE HUMAN DESK</Typography>
                        <Typography variant="h3" style={{ marginBottom: moderateScale(4) }}>Still need help?</Typography>
                        <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: moderateScale(20) }}>Our support team is available 24/7 to assist you.</Typography>

                        <View style={styles.contactRow}>
                            <HugeiconsIcon icon={Mail01Icon} size={moderateScale(20)} color={colors.ink} />
                            <Typography variant="bodyMedium">support@giftsync.app</Typography>
                        </View>

                        <View style={styles.contactRow}>
                            <HugeiconsIcon icon={TelephoneIcon} size={moderateScale(20)} color={colors.ink} />
                            <Typography variant="bodyMedium">+234 (0) 800-GIFTSYNC</Typography>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(0.9) },
    statusCard: { minHeight: moderateScale(128), borderWidth: 1.5, borderRadius: moderateScale(24), padding: moderateScale(18), flexDirection: 'row', alignItems: 'flex-start', gap: moderateScale(12), marginTop: moderateScale(8), marginBottom: moderateScale(28), },
    statusDot: { width: moderateScale(22), height: moderateScale(22), borderRadius: moderateScale(11), borderWidth: 1.5 },
    categorySection: {
        marginBottom: moderateScale(32),
    },
    faqCard: {
        padding: moderateScale(16),
        borderRadius: moderateScale(20),
        borderWidth: 1.5,
        marginBottom: moderateScale(12),
    },
    questionMark: { position: 'absolute', top: moderateScale(-8), right: moderateScale(13), width: moderateScale(29), height: moderateScale(29), borderRadius: moderateScale(10), borderWidth: 1.25, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '5deg' }] },
    contactCard: {
        padding: moderateScale(24),
        borderRadius: moderateScale(24),
        borderWidth: 1.5,
        marginTop: moderateScale(10),
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(12),
        marginBottom: moderateScale(12),
    }
});
