import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';

export default function ConversationListSkeleton() {
    const { colors } = useTheme();
    const notes = [colors.lemon, colors.lavender, colors.mint, colors.peach];

    return (
        <View style={styles.list}>
            {notes.map((color, index) => (
                <SkeletonPaper key={color} color={color} style={[styles.thread, { marginLeft: index % 2 ? 12 : 0, marginRight: index % 2 ? 0 : 12 }]}>
                    <View style={styles.avatarGroup}>
                        <Skeleton width={52} height={52} borderRadius={18} />
                        <Skeleton width={28} height={28} borderRadius={10} style={[styles.miniAvatar, { borderColor: colors.ink }]} />
                    </View>
                    <View style={styles.copy}>
                        <View style={styles.heading}>
                            <Skeleton width="48%" height={17} />
                            <Skeleton width={48} height={10} />
                        </View>
                        <Skeleton width="92%" height={12} />
                        <Skeleton width="70%" height={12} />
                    </View>
                    <Skeleton width={24} height={24} borderRadius={12} />
                </SkeletonPaper>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    list: { paddingHorizontal: 20, gap: 14 },
    thread: { minHeight: 94, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
    avatarGroup: { width: 61, height: 57 },
    miniAvatar: { position: 'absolute', right: 0, bottom: 0, borderWidth: 1.5 },
    copy: { flex: 1, gap: 7 },
    heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
