import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Typography from './Typography';
import { moderateScale } from '@/utils/scaling';

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
        <View style={[styles.header, { paddingTop: insets.top + moderateScale(10) }]}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={onBack}
                style={({ pressed }) => [styles.back, { backgroundColor: colors.surface, borderColor: colors.ink, opacity: pressed ? 0.65 : 1 }]}
            >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={moderateScale(22)} color={colors.ink} />
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
    header: { paddingHorizontal: moderateScale(20), paddingBottom: moderateScale(14), flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
    back: { width: moderateScale(44), height: moderateScale(44), borderWidth: 1.5, borderRadius: moderateScale(14), alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-3deg' }] },
    copy: { flex: 1 },
    eyebrow: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(1), textTransform: 'uppercase' },
    accent: { width: moderateScale(34), height: moderateScale(34), borderWidth: 1.5, borderRadius: moderateScale(11), transform: [{ rotate: '5deg' }] },
});
