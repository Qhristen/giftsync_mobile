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
            <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>PICK THE PAPER</Typography>
            <Typography variant="h2" style={{ marginBottom: spacing.lg }}>Set the room mood</Typography>

            <View style={styles.list}>
                {options.map((option, index) => {
                    const isSelected = currentPreference === option.value;
                    return (
                        <Pressable
                            key={option.value}
                            onPress={() => handleSelect(option.value)}
                            style={[
                                styles.item,
                                {
                                    backgroundColor: [colors.lemon, colors.lavender, colors.mint][index],
                                    borderColor: colors.ink,
                                },
                            ]}
                        >
                            <HugeiconsIcon
                                icon={option.icon}
                                size={24}
                                color={colors.ink}
                            />
                            <Typography
                                variant="bodyMedium"
                                color={colors.textPrimary}
                            >
                                {option.label}
                            </Typography>
                            {isSelected && (
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} color={colors.ink} style={styles.check} />
                            )}
                        </Pressable>
                    );
                })}
            </View>
        </BottomSheetWrapper>
    );
});

const styles = StyleSheet.create({
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 1 },
    list: {
        gap: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 18,
        borderWidth: 1.5,
        gap: 16,
    },
    check: {
        marginLeft: 'auto',
    },
});

ThemePickerSheet.displayName = 'ThemePickerSheet';

export default ThemePickerSheet;
