import { moderateFontScale } from '@/utils/scaling';

export const typography = {
    fonts: {
        heading: 'Fraunces_700Bold',
        body: 'DMSans_400Regular',
        bodyMedium: 'DMSans_500Medium',
        bodyBold: 'DMSans_700Bold',
    },
    sizes: {
        xs: moderateFontScale(12),
        sm: moderateFontScale(14),
        base: moderateFontScale(16),
        lg: moderateFontScale(18),
        xl: moderateFontScale(20),
        '2xl': moderateFontScale(24),
        '3xl': moderateFontScale(32),
        '4xl': moderateFontScale(40),
    },
    lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export type Typography = typeof typography;
