import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { LayoutAnimation, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const FAQS = [
    {
        question: "How do I get paid?",
        answer: "Payments are processed automatically and sent to your registered bank account. GiftSync operates on a weekly payment cycle."
    },
    {
        question: "When will I receive my earnings?",
        answer: "Payouts are made every Monday for all successfully delivered orders from the previous week (Monday to Sunday). Please ensure your bank details are correct in the Business Info section."
    },
    {
        question: "How do I mark an order as delivered?",
        answer: "Once the recipient receives the gift, ask them for their unique confirmation code. Enter this code in the order details screen under 'My Products' > 'Orders' to successfully complete the order and trigger payment processing."
    },
    {
        question: "What are the platform fees?",
        answer: "GiftSync charges a standard commission on each successful sale to cover platform maintenance, payment processing, and marketing. You can view the specific breakdown in your transaction history."
    },
    {
        question: "Can I cancel an order?",
        answer: "You can cancel an order if you are unable to fulfill it, but please do so as early as possible. Frequent cancellations may affect your seller rating and visibility on the platform."
    },
    {
        question: "How do I add new products?",
        answer: "Go to your Profile, tap on 'My Products', and use the '+' floating button or the 'Add New' link in the header to create a new product listing."
    }
];

export default function SellerFaqsScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

    const toggleExpand = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border + '33' }]}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h3">Seller FAQs</Typography>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                    Everything you need to know about selling on GiftSync.
                </Typography>

                {FAQS.map((faq, index) => {
                    const isExpanded = expandedIndex === index;
                    return (
                        <Pressable 
                            key={index} 
                            onPress={() => toggleExpand(index)}
                            style={[
                                styles.faqItem, 
                                { 
                                    backgroundColor: colors.surface,
                                    borderColor: isExpanded ? colors.primary : colors.border + '33'
                                }
                            ]}
                        >
                            <View style={styles.questionRow}>
                                <Typography variant="bodyBold" style={{ flex: 1 }}>{faq.question}</Typography>
                                <Ionicons 
                                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                                    size={20} 
                                    color={isExpanded ? colors.primary : colors.textMuted} 
                                />
                            </View>
                            {isExpanded && (
                                <Typography variant="body" color={colors.textSecondary} style={styles.answer}>
                                    {faq.answer}
                                </Typography>
                            )}
                        </Pressable>
                    );
                })}

                <View style={[styles.infoBox, { backgroundColor: colors.primary + '10' }]}>
                    <Ionicons name="information-circle" size={24} color={colors.primary} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Typography variant="bodyBold" color={colors.primary}>Weekly Payouts</Typography>
                        <Typography variant="caption" color={colors.primary}>
                            Remember: Earnings are settled every Monday for all orders successfully delivered in the previous week.
                        </Typography>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    faqItem: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    questionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    answer: {
        marginTop: 12,
        lineHeight: 20,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginTop: 20,
    }
});
