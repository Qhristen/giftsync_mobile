import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';

interface Props {
    label?: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    onSubmitEditing?: () => void;
    error?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
    multiline?: boolean;
    numberOfLines?: number;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    style?: StyleProp<ViewStyle>;
    isBottomSheet?: boolean;
}

const Input: React.FC<Props> = ({
    label,
    placeholder,
    value,
    onChangeText,
    onSubmitEditing,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
    leftIcon,
    rightIcon,
    autoCapitalize = 'sentences',
    style,
    isBottomSheet = false,
}) => {
    const { colors, spacing } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const containerStyles = [
        styles.inputContainer,
        {
            backgroundColor: colors.surfaceRaised,
            borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
            minHeight: multiline ? 100 : 56,
            paddingTop: multiline ? spacing.md : 0,
        },
    ];

    return (
        <View style={[styles.container, style]}>
            {label && (
                <Text style={[styles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                    {label}
                </Text>
            )}
            <View style={containerStyles}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
                {isBottomSheet ? (
                    <BottomSheetTextInput
                        style={[styles.input, { color: colors.textPrimary, textAlignVertical: multiline ? 'top' : 'center' }]}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textMuted}
                        value={value}
                        onChangeText={onChangeText}
                        onSubmitEditing={onSubmitEditing}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        secureTextEntry={secureTextEntry && !showPassword}
                        keyboardType={keyboardType}
                        multiline={multiline}
                        numberOfLines={numberOfLines}
                        autoCapitalize={autoCapitalize}
                    />
                ) : (
                    <TextInput
                        style={[styles.input, { color: colors.textPrimary, textAlignVertical: multiline ? 'top' : 'center' }]}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textMuted}
                        value={value}
                        onChangeText={onChangeText}
                        onSubmitEditing={onSubmitEditing}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        secureTextEntry={secureTextEntry && !showPassword}
                        keyboardType={keyboardType}
                        multiline={multiline}
                        numberOfLines={numberOfLines}
                        autoCapitalize={autoCapitalize}
                    />
                )}
                {secureTextEntry ? (
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
                        <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
                    </Pressable>
                ) : rightIcon ? (
                    <View style={styles.rightIcon}>{rightIcon}</View>
                ) : null}
            </View>
            {error && (
                <Text style={[styles.error, { color: colors.error, marginTop: spacing.xxs }]}>
                    {error}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        fontFamily: typography.fonts.bodyMedium,
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1.5,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        height: '100%',
        fontFamily: typography.fonts.body,
        fontSize: 16,
    },
    leftIcon: {
        marginRight: 10,
    },
    rightIcon: {
        marginLeft: 10,
    },
    error: {
        fontFamily: typography.fonts.body,
        fontSize: 12,
    },
});

export default Input;
