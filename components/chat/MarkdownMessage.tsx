import { useTheme } from '@/hooks/useTheme';
import React, { Fragment, useMemo } from 'react';
import { View } from 'react-native';
import { type MarkedStyles, useMarkdown } from 'react-native-marked';

interface MarkdownMessageProps {
    content: string;
    color?: string;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content, color }) => {
    const { colors, spacing, typography, scheme } = useTheme();
    const textColor = color || colors.textPrimary;

    const markdownStyles = useMemo<MarkedStyles>(() => ({
        text: {
            color: textColor,
            fontFamily: typography.fonts.body,
            fontSize: typography.sizes.base,
            lineHeight: 24,
        },
        paragraph: {
            paddingVertical: 0,
            marginBottom: spacing.sm,
        },
        strong: {
            color: textColor,
            fontFamily: typography.fonts.bodyBold,
            fontSize: typography.sizes.base,
            lineHeight: 24,
        },
        em: {
            color: textColor,
            fontFamily: typography.fonts.body,
            fontSize: typography.sizes.base,
            lineHeight: 24,
            fontStyle: 'italic',
        },
        strikethrough: {
            color: textColor,
            fontFamily: typography.fonts.body,
            fontSize: typography.sizes.base,
            lineHeight: 24,
        },
        h1: {
            color: textColor,
            fontFamily: typography.fonts.heading,
            fontSize: typography.sizes.xl,
            lineHeight: 28,
            marginTop: spacing.xs,
            marginBottom: spacing.sm,
            paddingBottom: 0,
            borderBottomWidth: 0,
        },
        h2: {
            color: textColor,
            fontFamily: typography.fonts.heading,
            fontSize: typography.sizes.lg,
            lineHeight: 26,
            marginTop: spacing.xs,
            marginBottom: spacing.sm,
            paddingBottom: 0,
            borderBottomWidth: 0,
        },
        h3: {
            color: textColor,
            fontFamily: typography.fonts.heading,
            fontSize: typography.sizes.base,
            lineHeight: 24,
            marginTop: spacing.xs,
            marginBottom: spacing.xs,
        },
        h4: {
            color: textColor,
            fontFamily: typography.fonts.bodyBold,
            fontSize: typography.sizes.base,
            lineHeight: 24,
            marginVertical: spacing.xs,
        },
        h5: {
            color: textColor,
            fontFamily: typography.fonts.bodyBold,
            fontSize: typography.sizes.sm,
            lineHeight: 20,
            marginVertical: spacing.xs,
        },
        h6: {
            color: colors.textSecondary,
            fontFamily: typography.fonts.bodyBold,
            fontSize: typography.sizes.xs,
            lineHeight: 18,
            marginVertical: spacing.xs,
        },
        link: {
            color: colors.primary,
            fontFamily: typography.fonts.bodyMedium,
            textDecorationLine: 'underline',
            fontStyle: 'normal',
        },
        blockquote: {
            borderLeftColor: colors.primary,
            borderLeftWidth: 3,
            paddingLeft: spacing.md,
            marginBottom: spacing.sm,
            opacity: 1,
        },
        codespan: {
            color: textColor,
            backgroundColor: colors.background,
            fontFamily: 'monospace',
            fontStyle: 'normal',
            fontWeight: '400',
        },
        code: {
            minWidth: '100%',
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 8,
            padding: spacing.md,
            marginBottom: spacing.sm,
        },
        codeText: {
            color: textColor,
            fontFamily: 'monospace',
            fontSize: typography.sizes.sm,
            lineHeight: 20,
        },
        list: {
            marginBottom: spacing.xs,
        },
        li: {
            color: textColor,
            fontFamily: typography.fonts.body,
            fontSize: typography.sizes.base,
            lineHeight: 24,
        },
        hr: {
            borderBottomColor: colors.border,
            marginVertical: spacing.sm,
        },
        table: {
            borderColor: colors.border,
            borderWidth: 1,
            marginBottom: spacing.sm,
        },
        tableCell: {
            padding: spacing.xs,
        },
    }), [colors, spacing, textColor, typography]);

    const markdownTheme = useMemo(() => ({
        colors: {
            code: colors.background,
            link: colors.primary,
            text: textColor,
            border: colors.border,
        },
        spacing: {
            xs: spacing.xs,
            s: spacing.sm,
            m: spacing.md,
            l: spacing.lg,
        },
    }), [colors, spacing, textColor]);

    const elements = useMarkdown(content, {
        colorScheme: scheme,
        styles: markdownStyles,
        theme: markdownTheme,
        selectable: false,
    });

    return (
        <View>
            {elements.map((element, index) => (
                <Fragment key={`markdown-${index}`}>{element}</Fragment>
            ))}
        </View>
    );
};

export default React.memo(MarkdownMessage);
