import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { darkColors, lightColors, spacing, Theme, typography } from '../theme';

export function useTheme(): Theme & { isDark: boolean; scheme: 'light' | 'dark' } {
    const userPreference = useSelector((state: RootState) => state.theme.preference);
    const systemScheme = useColorScheme();

    const resolvedScheme = userPreference === 'system'
        ? (systemScheme || 'light')
        : userPreference;

    const isDark = resolvedScheme === 'dark';
    const colors = isDark ? darkColors : lightColors;

    return {
        colors: colors as any,
        typography,
        spacing,
        isDark,
        scheme: isDark ? 'dark' : 'light',
    };
}
