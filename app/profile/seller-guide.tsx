import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01Icon,
    Camera01Icon,
    GiftIcon,
    ListViewIcon,
    TextSquareIcon
} from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { moderateScale } from '@/utils/scaling';export default function SellerGuideScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const sections = [
        {
            title: "Steps to Add Your Products",
            icon: ListViewIcon,
            steps: [
                "Open your profile and go to 'My Products'.",
                "Tap the '+' or 'Add Product' button.",
                "Provide a descriptive name and accurate price.",
                "Select the appropriate category for better visibility.",
                "Upload high-quality images and save."
            ]
        },
        {
            title: "Professional Presentation",
            icon: Camera01Icon,
            content: "Quality professional product images are essential. They help you market your products properly and build trust with customers. Use bright lighting and clean backgrounds to make your products stand out."
        },
        {
            title: "Safe & Premium Packaging",
            icon: GiftIcon,
            content: "Each product must be well-packaged. Proper packaging ensures the product arrives safely and improves the customer's unboxing experience. Consider using bubble wrap or sturdy boxes for fragile items."
        },
        {
            title: "Detailed Information",
            icon: TextSquareIcon,
            content: "Provide comprehensive product details. Accurate info helps your business market effectively and reduces the likelihood of returns or customer inquiries."
        }
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingBottom: spacing.md }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={moderateScale(24)} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: moderateScale(100) }} showsVerticalScrollIndicator={false}>
                <View>
                    <Typography variant="h1" style={{ marginBottom: moderateScale(8) }}>Seller Guide</Typography>
                    <Typography variant="body" color={colors.textSecondaryForeground} style={{ marginBottom: spacing.xl }}>
                        Follow these guidelines to maximize your sales and provide a great experience for your customers.
                    </Typography>

                    {sections.map((section, index) => (
                        <View
                            key={index}
                            style={[
                                styles.sectionCard,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    marginBottom: spacing.lg
                                }
                            ]}
                        >
                            <View style={styles.sectionHeader}>
                                <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                                    <HugeiconsIcon icon={section.icon} size={moderateScale(22)} color={colors.primary} />
                                </View>
                                <Typography variant="h3">{section.title}</Typography>
                            </View>

                            {section.steps ? (
                                <View style={styles.stepsContainer}>
                                    {section.steps.map((step, sIdx) => (
                                        <View key={sIdx} style={styles.stepRow}>
                                            <Typography variant="bodyBold" color={colors.primary} style={{ width: moderateScale(24) }}>{sIdx + 1}.</Typography>
                                            <Typography variant="body" color={colors.textSecondaryForeground} style={{ flex: 1 }}>{step}</Typography>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Typography variant="body" color={colors.textSecondaryForeground} style={{ lineHeight: moderateScale(24) }}>
                                    {section.content}
                                </Typography>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: moderateScale(50),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        width: moderateScale(40),
        height: moderateScale(40),
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    sectionCard: {
        padding: moderateScale(20),
        borderRadius: moderateScale(24),
        // borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(12),
        marginBottom: moderateScale(16),
    },
    iconBox: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepsContainer: {
        gap: moderateScale(12),
    },
    stepRow: {
        flexDirection: 'row',
        gap: moderateScale(4),
    }
});
