import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Badge from '../ui/Badge';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Typography from '../ui/Typography';

interface Occasion {
    id: string;
    type: string;
    date: string;
    countdown?: string;
    icon: any;
}

interface Props {
    occasions: Occasion[];
    onSelect: (occasion: Occasion) => void;
    isLoading?: boolean;
}

const OccasionPickerSheet = forwardRef<BottomSheetRef, Props>(
    ({ occasions, onSelect, isLoading }, ref) => {
        const { spacing, colors } = useTheme();

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['55%']} scrollable>
                <Typography variant="h2" style={{ marginBottom: spacing.sm }}>
                    Pick an Occasion
                </Typography>
                <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                    Choose which occasion you are sending this gift for.
                </Typography>

                <View style={styles.list}>
                    {occasions.map((occasion) => (
                        <Pressable
                            key={occasion.id}
                            onPress={() => onSelect(occasion)}
                            style={({ pressed }) => [
                                styles.item,
                                { backgroundColor: pressed ? colors.surfaceRaised : colors.surfaceRaised + '80' },
                            ]}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                                <Ionicons name={occasion.icon} size={24} color={colors.primary} />
                            </View>
                            <View style={styles.itemContent}>
                                <Typography variant="bodyBold">{occasion.type}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {occasion.date}
                                </Typography>
                            </View>
                            {occasion.countdown && (
                                <Badge label={occasion.countdown} size="xs" variant="amber" />
                            )}
                        </Pressable>
                    ))}

                    <Pressable
                        onPress={() => onSelect({ id: 'just-because', type: 'Just Because', date: 'Anytime', icon: 'sparkles-outline' })}
                        style={({ pressed }) => [
                            styles.item,
                            styles.justBecause,
                            { backgroundColor: pressed ? colors.primarySoft : colors.primarySoft + '40' },
                        ]}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                            <Ionicons name="sparkles-outline" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.itemContent}>
                            <Typography variant="bodyBold">This is just because</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>
                                No specific occasion needed
                            </Typography>
                        </View>
                    </Pressable>
                </View>
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    list: {
        gap: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    justBecause: {
        borderWidth: 1,
        borderColor: 'transparent',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemContent: {
        flex: 1,
    },
});

export default OccasionPickerSheet;
