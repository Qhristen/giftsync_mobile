import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function PrivacyPolicyScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const sections = [
        {
            title: '1. Information We Collect',
            content: 'We collect information you provide directly to us, including your name, email address, and profile picture via Google Authentication. If you choose to sync your calendar or contacts, we process birthday information to provide reminders.'
        },
        {
            title: '2. How We Use Your Information',
            content: 'We use the information we collect to: (a) provide and maintain GiftSync; (b) process transactions and send related information; (c) send you reminders for upcoming occasions; (d) personalize your experience with AI recommendations.'
        },
        {
            title: '3. Data Sharing & Disclosure',
            content: 'We share your information with vendors only as necessary to fulfill your orders (e.g., delivery address). We do not sell your personal data to third parties. We may disclose information if required by law or to protect our rights.'
        },
        {
            title: '4. AI Data Processing',
            content: 'Our AI recommendation engine processes anonymized event data to suggest gifts. We do not share your private contact identities with third-party Large Language Model (LLM) providers.'
        },
        {
            title: '5. Data Security',
            content: 'We implement industry-standard security measures to protect your data. This includes encryption for data in transit and at rest. However, no method of transmission over the internet is 100% secure.'
        },
        {
            title: '6. Your Rights & Choices',
            content: 'Under the Nigeria Data Protection Act (NDPA) and other applicable laws, you have the right to access, correct, or delete your personal data. You can manage your data preferences directly within the app settings.'
        },
        {
            title: '7. Data Retention',
            content: 'We retain your information for as long as your account is active or as needed to provide you services. You may delete your account at any time, which will initiate the permanent removal of your personal data from our systems.'
        },
        {
            title: '8. Updates to This Policy',
            content: 'We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.'
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
                    <Typography variant="h1" style={{ marginBottom: 8 }}>Privacy Policy</Typography>
                    <Typography variant="label" color={colors.primary} style={{ marginBottom: spacing.xl }}>Effective Date: May 2026</Typography>

                    {sections.map((section, index) => (
                        <View key={index} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                                    <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
                                </View>
                                <Typography variant="h3" style={{ flex: 1 }}>{section.title}</Typography>
                            </View>
                            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                <Typography variant="body" color={colors.textSecondary} style={{ lineHeight: 24 }}>
                                    {section.content}
                                </Typography>
                            </View>
                        </View>
                    ))}

                    <View style={[styles.footer, { marginTop: spacing.xl }]}>
                        <Typography variant="caption" color={colors.textMuted} align="center">
                            Privacy concerns? Reach out to privacy@giftsync.app
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
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
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
