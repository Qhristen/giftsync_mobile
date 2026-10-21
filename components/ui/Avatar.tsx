import { useTheme } from '@/hooks/useTheme';
import { typography } from '@/theme';
import { moderateScale } from '@/utils/scaling';
import { Image } from 'expo-image';
import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface Props {
    uri?: string;
    name?: string;
    size?: number | 'sm' | 'md' | 'lg' | 'xl';
    style?: StyleProp<ViewStyle>;
}

const Avatar: React.FC<Props> = ({ uri, name, size = 'md', style }) => {
    const { colors } = useTheme();

    const getPxSize = () => {
        if (typeof size === 'number') return size;
        switch (size) {
            case 'sm': return moderateScale(32);
            case 'md': return moderateScale(48);
            case 'lg': return moderateScale(64);
            case 'xl': return moderateScale(80);
            default: return moderateScale(48);
        }
    };

    const px = getPxSize();
    const initials = name
        ? name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : '?';

    return (
        <View
            style={[
                styles.container,
                {
                    width: px,
                    height: px,
                    borderRadius: px / 2,
                    backgroundColor: colors.surfaceRaised,
                    borderColor: colors.border,
                    borderWidth: 1,
                },
                style,
            ]}
        >
            {uri ? (
                <Image
                    source={{ uri }}
                    style={[styles.image, { borderRadius: px / 2 }]}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    recyclingKey={uri}
                />
            ) : (
                <Text style={[styles.initials, { fontSize: px / 2.5, color: colors.textSecondary }]}>
                    {initials}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    initials: {
        fontFamily: typography.fonts.bodyBold,
    },
});

export default React.memo(Avatar);
