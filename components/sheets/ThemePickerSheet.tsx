import { useTheme } from '@/hooks/useTheme';
import { RootState } from '@/store';
import { setThemePreference, ThemePreference } from '@/store/slices/themeSlice';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    CheckmarkCircle02Icon,
    Moon01Icon,
    SmartPhone01Icon,
    Sun01Icon,
} from '@hugeicons/core-free-icons';
import React, { forwardRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Typography from '../ui/Typography';

interface ThemePickerSheetProps {
    onSelect?: (preference: ThemePreference) => void;
}

const ThemePickerSheet = forwardRef<BottomSheetRef, ThemePickerSheetProps>(({ onSelect }, ref) => {
    const { colors, spacing } = useTheme();
    const dispatch = useDispatch();
    const currentPreference = useSelector((state: RootState) => state.theme.preference);

    const options: { label: string; value: ThemePreference; icon: any }[] = [
        { label: 'Light', value: 'light', icon: Sun01Icon },
        { label: 'Dark', value: 'dark', icon: Moon01Icon },
        { label: 'System', value: 'system', icon: SmartPhone01Icon },
    ];

    const handleSelect = (preference: ThemePreference) => {
        dispatch(setThemePreference(preference));
        if (onSelect) {
            onSelect(preference);
        }
    };

    return (
        <BottomSheetWrapper ref={ref} snapPoints={['35%']}>
            <Typography variant="h3" style={{ marginBottom: spacing.lg }}>
                Appearance
            </Typography>

            <View style={styles.list}>
                {options.map((option) => {
                    const isSelected = currentPreference === option.value;
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

export default ThemePickerSheet;
