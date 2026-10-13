import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';

export default function AddressListSkeleton() {
    const { colors } = useTheme();
    const paper = [colors.lemon, colors.mint, colors.sky];

    return (
        <View style={styles.list}>
            {paper.map((color, index) => (
                <SkeletonPaper key={color} color={color} style={[styles.card, { transform: [{ rotate: index % 2 ? '0.7deg' : '-0.7deg' }] }]}>
                    <Skeleton width={48} height={48} borderRadius={15} />
                    <View style={styles.copy}>
                        <View style={styles.row}>
                            <Skeleton width="42%" height={16} />
                            {index === 0 ? <Skeleton width={56} height={18} borderRadius={9} /> : null}
                        </View>
                        <Skeleton width="88%" height={12} />
                        <Skeleton width="62%" height={12} />
                    </View>
                    <Skeleton width={25} height={25} borderRadius={9} />
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: { paddingHorizontal: 16, gap: 14 },
    card: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 13 },
    copy: { flex: 1, gap: 7 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
