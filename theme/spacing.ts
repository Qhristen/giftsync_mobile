import { moderateScale } from "@/utils/scaling";

export const spacing = {
    none: moderateScale(0),
    xxs: moderateScale(2),
    xs: moderateScale(4),
    sm: moderateScale(8),
    md: moderateScale(12),
    lg: moderateScale(16),
    xl: moderateScale(20),
    '2xl': moderateScale(24),
    '3xl': moderateScale(32),
    '4xl': moderateScale(40),
    '5xl': moderateScale(48),
    '6xl': moderateScale(64),
    '7xl': moderateScale(80),
} as const;

export type Spacing = typeof spacing;
