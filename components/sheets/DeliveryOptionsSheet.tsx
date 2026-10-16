import { useTheme } from '@/hooks/useTheme';
import React, { forwardRef, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
    initialTimeWindow: 'morning' | 'afternoon' | 'evening' | null;
    onSave: (timeWindow: 'morning' | 'afternoon' | 'evening') => void;
}

const DeliveryOptionsSheet = forwardRef<BottomSheetRef, Props>(
    ({ initialTimeWindow, onSave }, ref) => {
        const { spacing, colors } = useTheme();
        const [timeWindow, setTimeWindow] = useState<'morning' | 'afternoon' | 'evening'>(initialTimeWindow || 'morning');
        const insets = useSafeAreaInsets();
        useEffect(() => {
            if (initialTimeWindow) setTimeWindow(initialTimeWindow);
        }, [initialTimeWindow]);

        const timeWindows = [
            { id: 'morning', label: 'Morning (8AM - 12PM)' },
            { id: 'afternoon', label: 'Afternoon (12PM - 4PM)' },
            { id: 'evening', label: 'Evening (4PM - 8PM)' },
        ] as const;

        const handleSave = () => {
            onSave(timeWindow);
        };

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['75%']} scrollable>
                <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>ARRIVAL WINDOW</Typography>
                <Typography variant="h2" style={{ marginBottom: spacing.sm }}>When should it land?</Typography>
                <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                    Choose a time window for the delivery.
                </Typography>

                <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
                    {timeWindows.map((tw, index) => (
                        <Pressable
                            key={tw.id}
                            onPress={() => setTimeWindow(tw.id)}
                            style={[
                                styles.option,
                                {
                                    backgroundColor: [colors.lemon, colors.sky, colors.peach][index],
                                    borderColor: colors.ink,
                                    transform: [{ rotate: index % 2 ? '0.5deg' : '-0.5deg' }],
                                }
                            ]}
                        >
                            <Typography variant="bodyBold">
                                {tw.label}
                            </Typography>
                            <View style={[
                                styles.radio,
                                { borderColor: colors.ink, backgroundColor: timeWindow === tw.id ? colors.lime : colors.surface }
                            ]}>
                                {timeWindow === tw.id && <View style={[styles.radioInner, { backgroundColor: colors.ink }]} />}
                            </View>
                        </Pressable>
                    ))}
                </View>

                <Button style={{ marginBottom: insets.bottom + 50, }} title="Save Selection" onPress={handleSave} />
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 1 },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 18,
        borderWidth: 1.5,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});

DeliveryOptionsSheet.displayName = 'DeliveryOptionsSheet';

export default DeliveryOptionsSheet;

