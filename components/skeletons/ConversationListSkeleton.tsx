import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

export default function ConversationListSkeleton() {
    const { colors } = useTheme();
    const notes = [colors.lemon, colors.lavender, colors.mint, colors.peach];

    return (
        <View style={styles.list}>
            {notes.map((color, index) => (
                <SkeletonPaper key={color} color={color} style={[styles.thread, { marginLeft: index % 2 ? moderateScale(12) : moderateScale(0), marginRight: index % 2 ? moderateScale(0) : moderateScale(12) }]}>
                    <View style={styles.avatarGroup}>
                        <Skeleton width={moderateScale(52)} height={moderateScale(52)} borderRadius={18} />
                        <Skeleton width={moderateScale(28)} height={moderateScale(28)} borderRadius={10} style={[styles.miniAvatar, { borderColor: colors.ink }]} />
                    </View>
                    <View style={styles.copy}>
                        <View style={styles.heading}>
                            <Skeleton width="48%" height={moderateScale(17)} />
                            <Skeleton width={moderateScale(48)} height={moderateScale(10)} />
                        </View>
                        <Skeleton width="92%" height={moderateScale(12)} />
                        <Skeleton width="70%" height={moderateScale(12)} />
                    </View>
                    <Skeleton width={moderateScale(24)} height={moderateScale(24)} borderRadius={12} />
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: { paddingHorizontal: moderateScale(20), gap: moderateScale(14) },
    thread: { minHeight: moderateScale(94), flexDirection: 'row', alignItems: 'center', padding: moderateScale(14), gap: moderateScale(12) },
    avatarGroup: { width: moderateScale(61), height: moderateScale(57) },
    miniAvatar: { position: 'absolute', right: moderateScale(0), bottom: moderateScale(0), borderWidth: 1.5 },
    copy: { flex: 1, gap: moderateScale(7) },
    heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
