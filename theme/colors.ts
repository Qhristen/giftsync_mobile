export const lightColors = {
    background: '#FDFAF6',
    surface: '#FFFFFF',
    surfaceRaised: '#F5F0EA',
    primary: '#C0392B',
    primarySoft: '#FDECEA',
    secondary: '#2C3E50',
    accent: '#E67E22',
    textPrimary: '#1A1A2E',
    textSecondary: '#424751ff',
    textSecondaryForeground: '#898989ff',
    textMuted: '#cfd1d4ff',
    border: '#E8E0D5',
    success: '#27AE60',
    error: '#E74C3C',
} as const;

export const darkColors = {
    background: '#0F0E11',
    surface: '#1A1820',
    surfaceRaised: '#242130',
    primary: '#E05C52',
    primarySoft: '#3D1F1D',
    secondary: '#ffffffff',
    accent: '#F59E0B',
    textPrimary: '#F1EEE9',
    textSecondary: '#bec3ccff',
    textSecondaryForeground: '#7b7c7eff',
    textMuted: '#444952ff',
    border: '#2D2B38',
    success: '#34D399',
    error: '#F87171',
} as const;

export type Colors = typeof lightColors;
