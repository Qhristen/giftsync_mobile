import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
                    <Typography variant="h1" style={{ marginBottom: 8 }}>Help Center</Typography>
                    <Typography variant="label" color={colors.primary} style={{ marginBottom: spacing.xl }}>Support team online</Typography>

                    {faqs.map((category, cIdx) => (
                        <View key={cIdx} style={styles.categorySection}>
                            <Typography variant="h3" style={{ marginBottom: 16 }}>{category.category}</Typography>
                            {category.questions.map((faq, fIdx) => (
                                <View key={fIdx} style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Typography variant="bodyBold" style={{ marginBottom: 8 }}>{faq.q}</Typography>
                                    <Typography variant="body" color={colors.textSecondary} style={{ lineHeight: 22 }}>{faq.a}</Typography>
                                </View>
                            ))}
                        </View>
                    ))}

                    <View style={[styles.contactCard, { backgroundColor: colors.primary }]}>
                        <Typography variant="h3" color="#FFFFFF" style={{ marginBottom: 4 }}>Still need help?</Typography>
                        <Typography variant="body" color="#FFFFFF" style={{ opacity: 0.9, marginBottom: 20 }}>Our support team is available 24/7 to assist you.</Typography>
                        
                        <View style={styles.contactRow}>
                            <Ionicons name="mail" size={20} color="#FFFFFF" />
                            <Typography variant="bodyMedium" color="#FFFFFF">support@giftsync.app</Typography>
                        </View>
                        
                        <View style={styles.contactRow}>
                            <Ionicons name="call" size={20} color="#FFFFFF" />
                            <Typography variant="bodyMedium" color="#FFFFFF">+234 (0) 800-GIFTSYNC</Typography>
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
    categorySection: {
        marginBottom: 32,
    },
    faqCard: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    contactCard: {
        padding: 24,
        borderRadius: 24,
        marginTop: 10,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    }
});
