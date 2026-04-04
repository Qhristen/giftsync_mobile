import { useTheme } from '@/hooks/useTheme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { forwardRef, useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

interface Props {
    initialDate: string | null;
    initialTimeWindow: 'morning' | 'afternoon' | 'evening' | null;
    onSave: (date: string, timeWindow: 'morning' | 'afternoon' | 'evening') => void;
}

const DeliveryOptionsSheet = forwardRef<BottomSheetRef, Props>(
    ({ initialDate, initialTimeWindow, onSave }, ref) => {
        const { spacing, colors } = useTheme();
        const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
        const [timeWindow, setTimeWindow] = useState<'morning' | 'afternoon' | 'evening'>(initialTimeWindow || 'morning');
        const [showPicker, setShowPicker] = useState(false);

        const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
            setShowPicker(Platform.OS === 'ios');
            if (selectedDate) {
                setDate(selectedDate.toISOString().split('T')[0]);
            }
        };

        useEffect(() => {
            if (initialDate) setDate(initialDate);
            if (initialTimeWindow) setTimeWindow(initialTimeWindow);
        }, [initialDate, initialTimeWindow]);

        const timeWindows = [
            { id: 'morning', label: 'Morning (8AM - 12PM)' },
            { id: 'afternoon', label: 'Afternoon (12PM - 4PM)' },
            { id: 'evening', label: 'Evening (4PM - 8PM)' },
        ] as const;

        const handleSave = () => {
            onSave(date, timeWindow);
        };

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['65%']} scrollable>
                <Typography variant="h2" style={{ marginBottom: spacing.sm }}>
                    Delivery Preference
                </Typography>
                <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                    Choose when you want the gift to be delivered.
                </Typography>

                <View style={{ gap: spacing.lg, marginBottom: spacing.xl }}>
                    <View>
                        <Typography variant="label" style={{ marginBottom: spacing.sm }}>Delivery Date</Typography>
                        {/* Note: using a date picker */}
                        <Pressable onPress={() => setShowPicker(true)}>
                            <View pointerEvents="none">
                                <Input
                                    value={date}
                                    onChangeText={setDate}
                                    placeholder="YYYY-MM-DD"
                                    isBottomSheet
                                />
                            </View>
                        </Pressable>
                        {showPicker && (
                            <DateTimePicker
                                value={date ? new Date(date) : new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onDateChange}
                                minimumDate={new Date()}
                            />
                        )}
                    </View>

                    <View>
                        <Typography variant="label" style={{ marginBottom: spacing.sm }}>Time Window</Typography>
                        <View style={{ gap: spacing.sm }}>
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
                    </View>
                </View>

                <Button title="Save Preferences" onPress={handleSave} />
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
