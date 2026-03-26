export const typography = {
    fonts: {
        heading: 'Fraunces_700Bold',
        body: 'DMSans_400Regular',
        bodyMedium: 'DMSans_500Medium',
        bodyBold: 'DMSans_700Bold',
    },
    sizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 32,
        '4xl': 40,
    },
    lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
} as const;

export type Typography = typeof typography;
