import { useTheme } from '@/hooks/useTheme';
import React, { forwardRef, useEffect, useState } from 'react';
import { View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Typography from '../ui/Typography';

interface Props {
    initialMessage: string;
    onSave: (message: string) => void;
}

const GiftMessageSheet = forwardRef<BottomSheetRef, Props>(
    ({ initialMessage, onSave }, ref) => {
        const { spacing, colors } = useTheme();
        const [message, setMessage] = useState(initialMessage);

        useEffect(() => {
            setMessage(initialMessage);
        }, [initialMessage]);

        const handleSave = () => {
            onSave(message);
        };

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['60%']} scrollable>
                <Typography variant="h2" style={{ marginBottom: spacing.sm }}>
                    Personal Message
                </Typography>
                <Typography variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                    Type your custom gift message here. It will be printed on a card.
                </Typography>

                <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
                    <Input
                        label="Message"
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Add a heartfelt message..."
                        multiline
                        numberOfLines={4}
                        style={{ height: 120 }}
                        isBottomSheet
                    />
                </View>

                <Button title="Save Message" onPress={handleSave} />
            </BottomSheetWrapper>
        );
    }
);

export default GiftMessageSheet;
