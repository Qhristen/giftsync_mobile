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
import { moderateScale } from '@/utils/scaling';

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
            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>MONEY LANGUAGE</Typography>
            <Typography variant="h2" style={{ marginBottom: spacing.lg }}>Choose your currency</Typography>

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
                                    backgroundColor: isSelected ? colors.lime : colors.lemon,
                                    borderColor: colors.ink,
                                },
                            ]}
                        >
                            <HugeiconsIcon
                                icon={option.icon}
                                size={moderateScale(24)}
                                color={colors.ink}
                            />
                            <Typography
                                variant="bodyMedium"
                                color={colors.textPrimary}
                            >
                                {option.label}
                            </Typography>
                            {isSelected && (
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={moderateScale(24)} color={colors.ink} style={styles.check} />
                            )}
                        </Pressable>
                    );
                })}
            </View>
        </BottomSheetWrapper>
    );
});

const styles = StyleSheet.create({
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(1) },
    list: {
        gap: moderateScale(12),
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(16),
        borderRadius: moderateScale(18),
        borderWidth: 1.5,
        gap: moderateScale(16),
    },
    check: {
        marginLeft: 'auto',
    },
});

CurrencyPickerSheet.displayName = 'CurrencyPickerSheet';

export default CurrencyPickerSheet;
