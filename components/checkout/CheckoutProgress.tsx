import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CheckoutStep = 1 | 2 | 3 | 4;

interface CheckoutProgressProps {
    step: CheckoutStep;
    eyebrow: string;
    title: string;
    onBack?: () => void;
}

const STEPS = ['Confirm', 'Route', 'Pay', 'Sent'];

export default function CheckoutProgress({ step, eyebrow, title, onBack }: CheckoutProgressProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.wrap, { paddingTop: insets.top + 10 }]}>
            <View style={styles.titleRow}>
                {onBack ? (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                        onPress={onBack}
                        style={({ pressed }) => [
                            styles.backButton,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.ink,
                                opacity: pressed ? 0.65 : 1,
                            },
                        ]}
                    >
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={21} color={colors.ink} />
                    </Pressable>
                ) : (
                    <View style={[styles.sentMark, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                        <Typography variant="bodyBold">✓</Typography>
                    </View>
                )}

                <View style={styles.titleCopy}>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.eyebrow}>
                        {eyebrow}
                    </Typography>
                    <Typography variant="h2" numberOfLines={2}>{title}</Typography>
                </View>

                <View style={[styles.stepStamp, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                    <Typography variant="caption" style={styles.stepStampCopy}>{String(step).padStart(2, '0')}/04</Typography>
                </View>
            </View>

            <View style={styles.progressRow}>
                {STEPS.map((label, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber <= step;
                    const isCurrent = stepNumber === step;

                    return (
                        <React.Fragment key={label}>
                            <View style={styles.progressItem}>
                                <View
                                    style={[
                                        styles.dot,
                                        {
                                            backgroundColor: isActive ? (isCurrent ? colors.lime : colors.ink) : colors.surface,
                                            borderColor: colors.ink,
                                        },
                                    ]}
                                />
                                <Typography
                                    variant="caption"
                                    color={isCurrent ? colors.textPrimary : colors.textSecondary}
                                    style={isCurrent ? styles.currentLabel : undefined}
                                >
                                    {label}
                                </Typography>
                            </View>
                            {index < STEPS.length - 1 ? (
                                <View
                                    style={[
                                        styles.connector,
                                        { backgroundColor: stepNumber < step ? colors.ink : colors.textMuted },
                                    ]}
                                />
                            ) : null}
                        </React.Fragment>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        paddingHorizontal: 20,
        paddingBottom: 14,
        gap: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        borderWidth: 1.5,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-3deg' }],
    },
    sentMark: {
        width: 44,
        height: 44,
        borderWidth: 1.5,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleCopy: {
        flex: 1,
    },
    eyebrow: {
        textTransform: 'uppercase',
        letterSpacing: 1.4,
        marginBottom: 1,
    },
    stepStamp: {
        borderWidth: 1.5,
        borderRadius: 10,
        paddingHorizontal: 9,
        paddingVertical: 7,
        transform: [{ rotate: '4deg' }],
    },
    stepStampCopy: {
        fontWeight: '800',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    progressItem: {
        alignItems: 'center',
        gap: 4,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 1.5,
    },
    connector: {
        flex: 1,
        height: 1.5,
        marginTop: 5,
        marginHorizontal: 5,
        opacity: 0.85,
    },
    currentLabel: {
        fontWeight: '800',
    },
});
