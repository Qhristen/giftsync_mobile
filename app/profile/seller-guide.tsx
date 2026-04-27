import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function SellerGuideScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    const sections = [
        {
            title: "Steps to Add Your Products",
            icon: "list-outline",
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
            icon: "camera-outline",
            content: "Quality professional product images are essential. They help you market your products properly and build trust with customers. Use bright lighting and clean backgrounds to make your products stand out."
        },
        {
            title: "Safe & Premium Packaging",
            icon: "gift-outline",
            content: "Each product must be well-packaged. Proper packaging ensures the product arrives safely and improves the customer's unboxing experience. Consider using bubble wrap or sturdy boxes for fragile items."
        },
        {
            title: "Detailed Information",
            icon: "text-outline",
            content: "Provide comprehensive product details. Accurate info helps your business market effectively and reduces the likelihood of returns or customer inquiries."
        }
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingBottom: spacing.md }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInUp.duration(400)}>
                    <Typography variant="h1" style={{ marginBottom: 8 }}>Seller Guide</Typography>
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
                                    <Ionicons name={section.icon as any} size={22} color={colors.primary} />
                                </View>
                                <Typography variant="h3">{section.title}</Typography>
                            </View>

                            {section.steps ? (
                                <View style={styles.stepsContainer}>
                                    {section.steps.map((step, sIdx) => (
                                        <View key={sIdx} style={styles.stepRow}>
                                            <Typography variant="bodyBold" color={colors.primary} style={{ width: 24 }}>{sIdx + 1}.</Typography>
                                            <Typography variant="body" color={colors.textSecondaryForeground} style={{ flex: 1 }}>{step}</Typography>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Typography variant="body" color={colors.textSecondaryForeground} style={{ lineHeight: 24 }}>
                                    {section.content}
                                </Typography>
                            )}
                        </View>
                    ))}
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
    sectionCard: {
        padding: 20,
        borderRadius: 24,
        // borderWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepsContainer: {
        gap: 12,
    },
    stepRow: {
        flexDirection: 'row',
        gap: 4,
    }
});
