import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';

export default function ShopScreenSkeleton() {
    const { colors } = useTheme();
    const palette = [colors.lemon, colors.lilac, colors.mint, colors.peach, colors.sky, colors.lemon];

    return (
        <View style={styles.grid}>
            {palette.map((color, index) => (
                <View key={`${color}-${index}`} style={[styles.wrapper, index % 2 ? styles.right : styles.left]}>
                    <SkeletonPaper color={colors.surface} style={[styles.card, { shadowColor: color }]}>
                        <View style={styles.imageWrap}>
                            <Skeleton width="100%" height={145} borderRadius={13} />
                            <View style={[styles.tab, { backgroundColor: color, borderColor: colors.ink }]} />
                        </View>
                        <View style={styles.content}>
                            <Skeleton width="86%" height={16} />
                            <Skeleton width="58%" height={11} />
                            <View style={styles.price}><Skeleton width={66} height={16} /><Skeleton width={32} height={32} borderRadius={11} /></View>
                        </View>
                    </SkeletonPaper>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: 12, paddingBottom: 110 },
    wrapper: { width: '50%', marginBottom: 18 },
    left: { paddingLeft: 20, paddingRight: 7 },
    right: { paddingRight: 20, paddingLeft: 7 },
    card: { overflow: 'visible' },
    imageWrap: { height: 145, margin: 8, marginBottom: 0 },
    tab: { position: 'absolute', width: 38, height: 12, borderWidth: 1, top: -13, left: 14, transform: [{ rotate: '-5deg' }] },
    content: { padding: 12, gap: 7 },
    price: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
});
