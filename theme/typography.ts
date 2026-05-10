import { moderateScale } from '@/utils/scaling';

export const typography = {
    fonts: {
        heading: 'Fraunces_700Bold',
        body: 'DMSans_400Regular',
        bodyMedium: 'DMSans_500Medium',
        bodyBold: 'DMSans_700Bold',
    },
    sizes: {
        xs: moderateScale(12),
        sm: moderateScale(14),
        base: moderateScale(16),
        lg: moderateScale(18),
        xl: moderateScale(20),
        '2xl': moderateScale(24),
        '3xl': moderateScale(32),
        '4xl': moderateScale(40),
    },
    lineHeights: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export type Typography = typeof typography;
