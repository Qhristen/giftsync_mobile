import { useTheme } from '@/hooks/useTheme';
import React, { forwardRef, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Typography from '../ui/Typography';

interface Props {
    initialTimeWindow: 'morning' | 'afternoon' | 'evening' | null;
    onSave: (timeWindow: 'morning' | 'afternoon' | 'evening') => void;
}

const DeliveryOptionsSheet = forwardRef<BottomSheetRef, Props>(
    ({ initialTimeWindow, onSave }, ref) => {
        const { spacing, colors } = useTheme();
        const [timeWindow, setTimeWindow] = useState<'morning' | 'afternoon' | 'evening'>(initialTimeWindow || 'morning');

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
            <BottomSheetWrapper ref={ref} snapPoints={['50%', "60%"]} scrollable>
                <Typography variant="h2" style={{ marginBottom: spacing.sm }}>
                    Delivery Time
                </Typography>
                <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                    Choose a time window for the delivery.
                </Typography>

                <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
                    {timeWindows.map((tw) => (
                        <Pressable
                            key={tw.id}
                            onPress={() => setTimeWindow(tw.id)}
                            style={[
                                styles.option,
                                {
                                    backgroundColor: colors.surface,
                                    borderColor: timeWindow === tw.id ? colors.primary : colors.border
                                }
                            ]}
                        >
                            <Typography variant="bodyBold" color={timeWindow === tw.id ? colors.primary : colors.textPrimary}>
                                {tw.label}
                            </Typography>
                            <View style={[
                                styles.radio,
                                { borderColor: timeWindow === tw.id ? colors.primary : colors.border }
                            ]}>
                                {timeWindow === tw.id && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                            </View>
                        </Pressable>
                    ))}
                </View>

                <Button title="Save Selection" onPress={handleSave} />
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
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

export default DeliveryOptionsSheet;

