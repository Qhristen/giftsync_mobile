import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';

export default function NotificationListSkeleton() {
    const { colors } = useTheme();
    const notes = [colors.lemon, colors.mint, colors.peach, colors.lavender];

    return (
        <View style={styles.board}>
            {notes.map((color, index) => (
                <SkeletonPaper key={color} color={color} style={[styles.note, { transform: [{ rotate: index % 2 ? '0.8deg' : '-0.8deg' }] }]}>
                    <View style={[styles.pin, { backgroundColor: colors.lime, borderColor: colors.ink }]} />
                    <Skeleton width={45} height={45} borderRadius={14} />
                    <View style={styles.copy}>
                        <View style={styles.row}>
                            <Skeleton width="46%" height={16} />
                            <Skeleton width={44} height={10} />
                        </View>
                        <Skeleton width="92%" height={12} />
                        <Skeleton width="67%" height={12} />
                    </View>
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    board: { paddingHorizontal: 20, gap: 15 },
    note: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 15 },
    pin: { position: 'absolute', top: -6, left: '49%', width: 13, height: 13, borderRadius: 7, borderWidth: 1.5, zIndex: 2 },
    copy: { flex: 1, gap: 7 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
