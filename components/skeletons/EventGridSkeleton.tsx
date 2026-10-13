import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';

export default function EventGridSkeleton() {
    const { colors } = useTheme();
    const palette = [colors.lemon, colors.lilac, colors.mint, colors.peach];

    return (
        <View style={styles.wrap}>
            <View style={styles.sectionHeading}>
                <Skeleton width={28} height={2} borderRadius={1} />
                <Skeleton width={128} height={15} />
            </View>
            {palette.map((color, index) => (
                <SkeletonPaper key={color} color={colors.surface} style={[styles.mapRow, { shadowColor: color, marginLeft: index % 2 ? 11 : 0, marginRight: index % 2 ? 0 : 11 }]}>
                    <View style={[styles.date, { backgroundColor: color, borderColor: colors.ink }]}>
                        <Skeleton width={30} height={21} />
                        <Skeleton width={24} height={9} />
                    </View>
                    <View style={styles.copy}>
                        <Skeleton width="70%" height={17} />
                        <Skeleton width="48%" height={12} />
                    </View>
                    <Skeleton width={38} height={38} borderRadius={12} />
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { paddingHorizontal: 20, paddingTop: 12, gap: 14 },
    sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    mapRow: { minHeight: 90, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
    date: { width: 58, height: 62, borderWidth: 1.25, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 4 },
    copy: { flex: 1, gap: 8 },
});
