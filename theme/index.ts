import { Colors, darkColors, lightColors } from './colors';
import { spacing, Spacing } from './spacing';
import { typography, Typography } from './typography';

export { Colors, darkColors, lightColors, spacing, Spacing, typography, Typography };

export interface Theme {
    colors: Colors;
    typography: Typography;
    spacing: Spacing;
}
