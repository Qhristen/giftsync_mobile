import { useTheme } from '@/hooks/useTheme';
import { Event } from '@/types';
import { getCountdown } from '@/utils/dateUtils';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Typography from '../ui/Typography';


interface Props {
    events: Event[];
    onSelect: (event: Event) => void;
    isLoading?: boolean;
}

const EventPickerSheet = forwardRef<BottomSheetRef, Props>(
    ({ events, onSelect, isLoading }, ref) => {
        const { spacing, colors } = useTheme();

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['75%']} scrollable>
                <Typography variant="h2" style={{ marginBottom: spacing.sm }}>
                    Pick an Event
                </Typography>
                <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                    Choose which event you are sending this gift for.
                </Typography>

                <View style={styles.list}>
                    {events.map((event) => (
                        <Pressable
                            key={event.id}
                            onPress={() => onSelect(event)}
                            style={({ pressed }) => [
                                styles.item,
                                { backgroundColor: pressed ? colors.surfaceRaised : colors.surfaceRaised + '80' },
                            ]}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                                <Avatar uri={event.contact?.avatar} name={event.contact?.name} size="sm" />
                            </View>
                            <View style={styles.itemContent}>
                                <Typography variant="bodyBold">{event.contact?.name}</Typography>
                                <Typography variant="caption" color={colors.textSecondary}>
                                    {event.title} - {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Typography>
                            </View>
                            {event.date && (
                                <Badge label={getCountdown(event.date)} size="xs" variant="amber" />
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

export default EventPickerSheet;
