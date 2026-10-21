import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

export default function AddressListSkeleton() {
    const { colors } = useTheme();
    const paper = [colors.lemon, colors.mint, colors.sky];

    return (
        <View style={styles.list}>
            {paper.map((color, index) => (
                <SkeletonPaper key={color} color={color} style={[styles.card, { transform: [{ rotate: index % 2 ? '0.7deg' : '-0.7deg' }] }]}>
                    <Skeleton width={moderateScale(48)} height={moderateScale(48)} borderRadius={15} />
                    <View style={styles.copy}>
                        <View style={styles.row}>
                            <Skeleton width="42%" height={moderateScale(16)} />
                            {index === 0 ? <Skeleton width={moderateScale(56)} height={moderateScale(18)} borderRadius={9} /> : null}
                        </View>
                        <Skeleton width="88%" height={moderateScale(12)} />
                        <Skeleton width="62%" height={moderateScale(12)} />
                    </View>
                    <Skeleton width={moderateScale(25)} height={moderateScale(25)} borderRadius={9} />
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: { paddingHorizontal: moderateScale(16), gap: moderateScale(14) },
    card: { flexDirection: 'row', alignItems: 'center', padding: moderateScale(15), gap: moderateScale(13) },
    copy: { flex: 1, gap: moderateScale(7) },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
