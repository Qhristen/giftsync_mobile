import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

export default function NotificationListSkeleton() {
    const { colors, spacing } = useTheme();

    return (
        <View>
            {[1, 2, 3, 4, 5, 6].map((_, index) => (
                <View key={index} style={[styles.notificationItem, { borderBottomColor: colors.border + '11' }]}>
                    <Skeleton width={48} height={48} borderRadius={24} />
                    <View style={styles.textContainer}>
                        <View style={styles.titleRow}>
                            <Skeleton width="50%" height={16} borderRadius={4} />
                            <Skeleton width={60} height={12} borderRadius={4} />
                        </View>
                        <View style={{ marginTop: 8, gap: 4 }}>
                            <Skeleton width="90%" height={12} borderRadius={4} />
                            <Skeleton width="70%" height={12} borderRadius={4} />
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 20,
        borderBottomWidth: 1,
    },
    textContainer: {
        flex: 1,
        marginLeft: 16,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
