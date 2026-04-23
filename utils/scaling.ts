import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Base design width (iPhone X / standard design).
 * All sizes in the app are assumed to be designed for this width.
 */
const BASE_WIDTH = 375;

const scaleRatio = SCREEN_WIDTH / BASE_WIDTH;

/**
 * Linear scale — directly proportional to screen width.
 * Use sparingly; prefer `moderateScale` for most cases.
 */
export function scale(size: number): number {
    return size * scaleRatio;
}

/**
 * Moderate scale — scales with a dampening factor.
 * @param size   The base size (designed for 375pt width)
 * @param factor How aggressively to scale (0 = none, 1 = full). Default 0.5
 */
export function moderateScale(size: number, factor: number = 0.5): number {
    return size + (scaleRatio - 1) * size * factor;
}

/**
 * Font-specific moderate scale.
 * Rounds to the nearest pixel for crisp text rendering.
 */
export function moderateFontScale(size: number, factor: number = 0.5): number {
    return PixelRatio.roundToNearestPixel(moderateScale(size, factor));
}
