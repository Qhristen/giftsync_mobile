import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Typography from '../ui/Typography';

interface CurrencyPickerSheetProps {
    currentCurrency: string;
    onSelect: (currency: string) => void;
}

const CurrencyPickerSheet = forwardRef<BottomSheetRef, CurrencyPickerSheetProps>(({ currentCurrency, onSelect }, ref) => {
    const { colors, spacing } = useTheme();

    const options = [
        { label: 'Nigerian Naira (NGN)', value: 'NGN', icon: 'cash-outline' },
        { label: 'US Dollar (USD)', value: 'USD', icon: 'logo-usd' },
        { label: 'British Pound (GBP)', value: 'GBP', icon: 'logo-pound' },
        { label: 'Euro (EUR)', value: 'EUR', icon: 'logo-euro' },
    ];

    const handleSelect = (currency: string) => {
        onSelect(currency);
    };

    return (
        <BottomSheetWrapper ref={ref} snapPoints={['40%']}>
            <Typography variant="h3" style={{ marginBottom: spacing.lg }}>
                Select Currency
            </Typography>

            <View style={styles.list}>
                {options.map((option) => {
                    const isSelected = currentCurrency === option.value;
                    return (
                        <Pressable
                            key={option.value}
                            onPress={() => handleSelect(option.value)}
                            style={[
                                styles.item,
                                {
                                    backgroundColor: isSelected ? colors.primarySoft : colors.surfaceRaised,
                                    borderColor: isSelected ? colors.primary : 'transparent',
                                },
                            ]}
                        >
                            <Ionicons
                                name={option.icon as any}
                                size={24}
                                color={isSelected ? colors.primary : colors.textPrimary}
                            />
                            <Typography
                                variant="bodyMedium"
                                color={isSelected ? colors.primary : colors.textPrimary}
                            >
                                {option.label}
                            </Typography>
                            {isSelected && (
                                <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={styles.check} />
                            )}
                        </Pressable>
                    );
                })}
            </View>
        </BottomSheetWrapper>
    );
});

const styles = StyleSheet.create({
    list: {
        gap: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        gap: 16,
    },
    check: {
        marginLeft: 'auto',
    },
});

export default CurrencyPickerSheet;
