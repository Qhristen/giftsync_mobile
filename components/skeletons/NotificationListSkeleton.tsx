import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

export default function NotificationListSkeleton() {
    const { colors } = useTheme();
    const notes = [colors.lemon, colors.mint, colors.peach, colors.lavender];

    return (
        <View style={styles.board}>
            {notes.map((color, index) => (
                <SkeletonPaper key={color} color={color} style={[styles.note, { transform: [{ rotate: index % 2 ? '0.8deg' : '-0.8deg' }] }]}>
                    <View style={[styles.pin, { backgroundColor: colors.lime, borderColor: colors.ink }]} />
                    <Skeleton width={moderateScale(45)} height={moderateScale(45)} borderRadius={14} />
                    <View style={styles.copy}>
                        <View style={styles.row}>
                            <Skeleton width="46%" height={moderateScale(16)} />
                            <Skeleton width={moderateScale(44)} height={moderateScale(10)} />
                        </View>
                        <Skeleton width="92%" height={moderateScale(12)} />
                        <Skeleton width="67%" height={moderateScale(12)} />
                    </View>
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    board: { paddingHorizontal: moderateScale(20), gap: moderateScale(15) },
    note: { flexDirection: 'row', alignItems: 'flex-start', gap: moderateScale(12), padding: moderateScale(15) },
    pin: { position: 'absolute', top: moderateScale(-6), left: '49%', width: moderateScale(13), height: moderateScale(13), borderRadius: moderateScale(7), borderWidth: 1.5, zIndex: 2 },
    copy: { flex: 1, gap: moderateScale(7) },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
