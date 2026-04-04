import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Badge from '../ui/Badge';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Typography from '../ui/Typography';
import { Occasion } from '@/types';
import { getCountdown } from '@/utils/dateUtils';
import Avatar from '../ui/Avatar';


interface Props {
    occasions: Occasion[];
    onSelect: (occasion: Occasion) => void;
    isLoading?: boolean;
}

const OccasionPickerSheet = forwardRef<BottomSheetRef, Props>(
    ({ occasions, onSelect, isLoading }, ref) => {
        const { spacing, colors } = useTheme();

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['75%']} scrollable>
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
                               <Avatar uri={occasion.contactAvatar} name={occasion.contactName} size="sm" />
                            </View>
                            <View style={styles.itemContent}>
                                <Typography variant="bodyBold">{occasion.contactName}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {occasion.type} - {new Date(occasion.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Typography>
                            </View>
                            {occasion.date && (
                                <Badge label={getCountdown(occasion.date)} size="xs" variant="amber" />
                            )}
                        </Pressable>
                    ))}

                   
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
