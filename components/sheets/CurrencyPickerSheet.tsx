import { useTheme } from '@/hooks/useTheme';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    CheckmarkCircle02Icon,
    Coins01Icon,
} from '@hugeicons/core-free-icons';
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
        { label: 'Nigerian Naira (NGN)', value: 'NGN', icon: Coins01Icon },
        // { label: 'US Dollar (USD)', value: 'USD', icon: Coins01Icon },
        // { label: 'British Pound (GBP)', value: 'GBP', icon: Coins01Icon },
        // { label: 'Euro (EUR)', value: 'EUR', icon: Coins01Icon },
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
                            <HugeiconsIcon
                                icon={option.icon}
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
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} color={colors.primary} style={styles.check} />
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
