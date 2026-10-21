import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { moderateScale } from '@/utils/scaling';

interface FeatureUnavailableProps {
    title: string;
    message?: string;
}

export default function FeatureUnavailable({
    title,
    message = 'This feature is temporarily unavailable. Please check back shortly.',
}: FeatureUnavailableProps) {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background, paddingHorizontal: spacing.xl }]}>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                <Typography variant="h2" align="center">{title}</Typography>
                <Typography variant="body" color={colors.textSecondary} align="center">{message}</Typography>
                <Pressable onPress={() => router.back()} style={[styles.button, { backgroundColor: colors.ink }]}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={moderateScale(18)} color={colors.surface} />
                    <Typography variant="bodyBold" color={colors.surface}>Go back</Typography>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    card: {
        width: '100%', borderWidth: 1.5, borderRadius: moderateScale(24), padding: moderateScale(24),
        alignItems: 'center', gap: moderateScale(12),
    },
    button: {
        minHeight: moderateScale(46), borderRadius: moderateScale(14), paddingHorizontal: moderateScale(18), flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', gap: moderateScale(8), marginTop: moderateScale(4),
    },
});
