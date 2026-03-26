import { useTheme } from '@/hooks/useTheme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { forwardRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

export interface OccasionFormData {
    name: string;
    type: string;
    date: string;
}

interface Props {
    onSubmit: (data: OccasionFormData) => void;
    isLoading?: boolean;
}

const CreateOccasionSheet = forwardRef<BottomSheetRef, Props>(
    ({ onSubmit, isLoading }, ref) => {
        const { spacing, colors } = useTheme();
        const [name, setName] = useState('');
        const [type, setType] = useState('');
        const [date, setDate] = useState(new Date());
        const [showPicker, setShowPicker] = useState(false);

        const formattedDate = date.toLocaleString('default', { month: 'long', day: 'numeric' });

        const handleSubmit = () => {
            if (!name || !type) return;
            onSubmit({ name, type, date: formattedDate });
            setName('');
            setType('');
            setDate(new Date());
        };

        const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
            if (Platform.OS === 'android') {
                setShowPicker(false);
            }
            if (selectedDate) {
                setDate(selectedDate);
            }
        };

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['65%']} scrollable>
                <Typography variant="h2" style={{ marginBottom: spacing.sm }}>
                    Create Occasion
                </Typography>
                <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                    Add a custom occasion manually. This costs 1 coin.
                </Typography>

                <View style={styles.form}>
                    <Input
                        label="Occasion Name"
                        placeholder="e.g. John's Graduation"
                        value={name}
                        onChangeText={setName}
                    />
                    <Input
                        label="Type"
                        placeholder="e.g. Graduation, Wedding"
                        value={type}
                        onChangeText={setType}
                    />

                    <Pressable onPress={() => setShowPicker(true)}>
                        <View pointerEvents="none">
                            <Input
                                label="Date"
                                placeholder="Select a date"
                                value={formattedDate}
                                onChangeText={() => { }}
                            />
                        </View>
                    </Pressable>

                    {showPicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                        />
                    )}

                    <Button
                        title="Create Occasion (1 Coin)"
                        onPress={handleSubmit}
                        disabled={!name || !type || isLoading}
                        isLoading={isLoading}
                        style={{ marginTop: spacing.md }}
                    />
                </View>
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    form: {
        gap: 16,
    },
});

export default CreateOccasionSheet;
