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
                <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>CHOOSE THE MOMENT</Typography>
                <Typography variant="h2" style={{ marginBottom: spacing.sm }}>Who are we gifting?</Typography>
                <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                    Choose which event you are sending this gift for.
                </Typography>

                <View style={styles.list}>
                    {events.map((event, index) => (
                        <Pressable
                            key={event.id}
                            onPress={() => onSelect(event)}
                            style={({ pressed }) => [
                                styles.item,
                                { backgroundColor: [colors.lemon, colors.lavender, colors.mint, colors.peach][index % 4], borderColor: colors.ink, shadowColor: colors.ink, opacity: pressed ? 0.72 : 1, transform: [{ rotate: index % 2 ? '0.4deg' : '-0.4deg' }] },
                            ]}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
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
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 1 },
    list: {
        gap: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 19,
        borderWidth: 1.5,
        gap: 12,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 0,
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
        borderWidth: 1.25,
    },
    itemContent: {
        flex: 1,
    },
});

EventPickerSheet.displayName = 'EventPickerSheet';

export default EventPickerSheet;
