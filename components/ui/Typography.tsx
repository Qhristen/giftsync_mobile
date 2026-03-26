import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';

interface Props {
    children: React.ReactNode;
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodyMedium' | 'bodyBold' | 'caption' | 'label';
    color?: string;
    align?: 'auto' | 'left' | 'center' | 'right' | 'justify';
    numberOfLines?: number;
    style?: StyleProp<TextStyle>;
}

const Typography: React.FC<Props> = ({
    children,
    variant = 'body',
    color,
    align = 'auto',
    numberOfLines,
    style,
}) => {
    const { colors, typography: themeTypography } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'h1':
                return {
                    fontFamily: themeTypography.fonts.heading,
                    fontSize: themeTypography.sizes['3xl'],
                    lineHeight: 40,
                };
            case 'h2':
                return {
                    fontFamily: themeTypography.fonts.heading,
                    fontSize: themeTypography.sizes['2xl'],
                    lineHeight: 32,
                };
            case 'h3':
                return {
                    fontFamily: themeTypography.fonts.heading,
                    fontSize: themeTypography.sizes.xl,
                    lineHeight: 28,
                };
            case 'h4':
                return {
                    fontFamily: themeTypography.fonts.heading,
                    fontSize: themeTypography.sizes.lg,
                    lineHeight: 24,
                };
            case 'bodyBold':
                return {
                    fontFamily: themeTypography.fonts.bodyBold,
                    fontSize: themeTypography.sizes.base,
                    lineHeight: 24,
                };
            case 'bodyMedium':
                return {
                    fontFamily: themeTypography.fonts.bodyMedium,
                    fontSize: themeTypography.sizes.base,
                    lineHeight: 24,
                };
            case 'caption':
                return {
                    fontFamily: themeTypography.fonts.body,
                    fontSize: themeTypography.sizes.xs,
                    lineHeight: 16,
                };
            case 'label':
                return {
                    fontFamily: themeTypography.fonts.bodyMedium,
                    fontSize: themeTypography.sizes.sm,
                    lineHeight: 20,
                };
            case 'body':
            default:
                return {
                    fontFamily: themeTypography.fonts.body,
                    fontSize: themeTypography.sizes.base,
                    lineHeight: 24,
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <Text
            numberOfLines={numberOfLines}
            style={[
                variantStyles,
                { color: color || colors.textPrimary, textAlign: align },
                style,
            ]}
        >
            {children}
        </Text>
    );
};

export default Typography;
