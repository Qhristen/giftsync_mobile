import Typography from '@/components/ui/Typography';
import PaperScreenHeader from '@/components/ui/PaperScreenHeader';
import { useTheme } from '@/hooks/useTheme';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Shield01Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { moderateScale } from '@/utils/scaling';export default function PrivacyPolicyScreen() {
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
            <PaperScreenHeader eyebrow="Your private file" title="What stays between us" onBack={() => router.back()} accent={colors.lavender} />

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: moderateScale(100) }}
                showsVerticalScrollIndicator={false}
            >
                <View>
                    <View style={[styles.vaultCover, { backgroundColor: colors.lavender, borderColor: colors.ink }]}>
                        <View style={[styles.shieldSeal, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={Shield01Icon} size={moderateScale(34)} color={colors.ink} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>PRIVACY PROMISE · MAY 2026</Typography>
                            <Typography variant="h2">Your data has a locked drawer.</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>Here is what enters it, why, and how you stay in control.</Typography>
                        </View>
                    </View>

                    {sections.map((section, index) => (
                        <View key={index} style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.iconBox, { backgroundColor: [colors.mint, colors.peach, colors.lemon][index % 3], borderColor: colors.ink }]}>
                                    <Typography variant="caption" style={styles.overline}>{String(index + 1).padStart(2, '0')}</Typography>
                                </View>
                                <Typography variant="h3" style={{ flex: 1 }}>{section.title.replace(/^\d+\.\s*/, '')}</Typography>
                            </View>
                            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <Typography variant="body" color={colors.textSecondary} style={{ lineHeight: moderateScale(24) }}>
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
    vaultCover: { minHeight: moderateScale(156), padding: moderateScale(19), borderWidth: 1.5, borderRadius: moderateScale(25), flexDirection: 'row', alignItems: 'center', gap: moderateScale(14), marginTop: moderateScale(8), marginBottom: moderateScale(30), transform: [{ rotate: '0.6deg' }] },
    shieldSeal: { width: moderateScale(68), height: moderateScale(68), borderRadius: moderateScale(22), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-4deg' }] },
    section: {
        marginBottom: moderateScale(24),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(12),
        marginBottom: moderateScale(12),
    },
    iconBox: {
        width: moderateScale(32),
        height: moderateScale(32),
        borderRadius: moderateScale(10),
        borderWidth: 1.25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        padding: moderateScale(20),
        borderRadius: moderateScale(20),
        borderWidth: 1.5,
    },
    footer: {
        paddingVertical: moderateScale(20),
        borderTopWidth: 1,
        borderTopColor: '#f0f0f033',
    }
});
