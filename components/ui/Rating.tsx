import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

interface RatingProps {
    rating: number;
    maxRating?: number;
    onRatingChange?: (rating: number) => void;
    size?: number;
    style?: ViewStyle;
    readonly?: boolean;
}

const Rating: React.FC<RatingProps> = ({
    rating,
    maxRating = 5,
    onRatingChange,
    size = 24,
    style,
    readonly = false,
}) => {
    const { colors } = useTheme();

    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
        stars.push(
            <Pressable
                key={i}
                onPress={() => !readonly && onRatingChange?.(i)}
                disabled={readonly}
                style={{ padding: 4 }}
            >
                <Ionicons
                    name={i <= rating ? 'star' : 'star-outline'}
                    size={size}
                    color={i <= rating ? '#FFD700' : colors.textMuted}
                />
            </Pressable>
        );
    }

    return <View style={[styles.container, style]}>{stars}</View>;
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default Rating;
