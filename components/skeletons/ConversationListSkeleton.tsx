import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

export default function ConversationListSkeleton() {
    const { colors, spacing } = useTheme();

    return (
        <View style={{ paddingHorizontal: spacing.xl }}>
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
                <View key={index} style={[styles.container, { borderBottomColor: colors.border + '11' }]}>
                    <View style={styles.avatarGroup}>
                        <Skeleton width={55} height={55} borderRadius={27.5} />
                        <View style={[styles.avatarOverlap, { borderColor: colors.background }]}>
                             <Skeleton width={55} height={55} borderRadius={27.5} />
                        </View>
                    </View>
                    
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Skeleton width="60%" height={16} borderRadius={4} />
                            <Skeleton width={60} height={12} borderRadius={4} />
                        </View>
                        <View style={styles.footer}>
                            <Skeleton width="85%" height={14} borderRadius={4} />
                            <Skeleton width={20} height={20} borderRadius={10} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        gap: 12,
        borderBottomWidth: 1,
    },
    avatarGroup: {
        width: 70, // Rough estimate of group width
        height: 55,
        position: 'relative',
    },
    avatarOverlap: {
        position: 'absolute',
        left: 15,
        top: 0,
        borderWidth: 2,
        borderRadius: 30,
    },
    content: {
        flex: 1,
        gap: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
