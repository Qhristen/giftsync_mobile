import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Linear scale: scales a given size proportionally to the screen width.
 * Useful for horizontal spacing and element widths.
 */
export const scale = (size: number) => (width / guidelineBaseWidth) * size;

/**
 * Vertical scale: scales a given size proportionally to the screen height.
 * Useful for vertical spacing and element heights.
 */
export const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

/**
 * Moderate scale: linearly scales a size but limits the growth using a factor.
 * Ideal for typography and elements where you don't want extreme size differences
 * on tablets compared to small phones.
 * @param size Target size
 * @param factor Growth factor, default is 0.5 (scales halfway between original and linearly scaled size)
 */
export const moderateScale = (size: number, factor = 0.2) => size + (scale(size) - size) * factor;

/**
 * Pixel ratio-based scaling for typography.
 * Adapts to device pixel density and ensures text rendering is sharp.
 */
export function normalize(size: number, factor = 0.2) {
    const newSize = moderateScale(size, factor);
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1;
    }
}
