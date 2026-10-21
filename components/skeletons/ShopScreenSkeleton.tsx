import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

export default function ShopScreenSkeleton() {
    const { colors } = useTheme();
    const palette = [colors.lemon, colors.lilac, colors.mint, colors.peach, colors.sky, colors.lemon];

    return (
        <View style={styles.grid}>
            {palette.map((color, index) => (
                <View key={`${color}-${index}`} style={[styles.wrapper, index % 2 ? styles.right : styles.left]}>
                    <SkeletonPaper color={colors.surface} style={[styles.card, { }]}>
                        <View style={styles.imageWrap}>
                            <Skeleton width="100%" height={moderateScale(145)} borderRadius={13} />
                            <View style={[styles.tab, { backgroundColor: color, borderColor: colors.ink }]} />
                        </View>
                        <View style={styles.content}>
                            <Skeleton width="86%" height={moderateScale(16)} />
                            <Skeleton width="58%" height={moderateScale(11)} />
                            <View style={styles.price}><Skeleton width={moderateScale(66)} height={moderateScale(16)} /><Skeleton width={moderateScale(32)} height={moderateScale(32)} borderRadius={11} /></View>
                        </View>
                    </SkeletonPaper>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: moderateScale(12), paddingBottom: moderateScale(110) },
    wrapper: { width: '50%', marginBottom: moderateScale(18) },
    left: { paddingLeft: moderateScale(20), paddingRight: moderateScale(7) },
    right: { paddingRight: moderateScale(20), paddingLeft: moderateScale(7) },
    card: { overflow: 'visible' },
    imageWrap: { height: moderateScale(145), margin: moderateScale(8), marginBottom: moderateScale(0) },
    tab: { position: 'absolute', width: moderateScale(38), height: moderateScale(12), borderWidth: 1, top: moderateScale(-13), left: moderateScale(14), transform: [{ rotate: '-5deg' }] },
    content: { padding: moderateScale(12), gap: moderateScale(7) },
    price: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: moderateScale(4) },
});
