import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Typography from './Typography';

interface PaperScreenHeaderProps {
    eyebrow: string;
    title: string;
    onBack: () => void;
    accent?: string;
    right?: React.ReactNode;
}

export default function PaperScreenHeader({ eyebrow, title, onBack, accent, right }: PaperScreenHeaderProps) {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={onBack}
                style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.ink, opacity: pressed ? 0.65 : 1 }]}
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={colors.ink} />
            </Pressable>
            <View style={styles.copy}>
                <Typography variant="caption" color={colors.textSecondary} style={styles.eyebrow}>{eyebrow}</Typography>
                <Typography variant="h2" numberOfLines={2}>{title}</Typography>
            </View>
            {right || <View style={[styles.accent, { backgroundColor: accent || colors.lime, borderColor: colors.ink }]} />}
        </View>
    );
}

const styles = StyleSheet.create({
    header: { paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    back: { width: 44, height: 44, borderWidth: 1.5, borderRadius: 14, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-3deg' }] },
    copy: { flex: 1 },
    eyebrow: { fontFamily: 'DMSans_700Bold', letterSpacing: 1, textTransform: 'uppercase' },
    accent: { width: 34, height: 34, borderWidth: 1.5, borderRadius: 11, transform: [{ rotate: '5deg' }] },
});
