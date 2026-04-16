import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

const { width } = Dimensions.get('window');

export default function HomeScreenSkeleton() {
    const { colors, spacing } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={[styles.header, { padding: spacing.xl }]}>
                    <View>
                        <Skeleton width={120} height={16} borderRadius={4} style={{ marginBottom: 8 }} />
                        <Skeleton width={80} height={24} borderRadius={4} />
                    </View>
                    <Skeleton width={44} height={44} borderRadius={22} />
                </View>

                {/* Hero Card */}
                <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.xl }}>
                    <View style={[styles.heroCard, { backgroundColor: colors.surfaceRaised }]}>
                        <View style={styles.heroHeader}>
                            <Skeleton width={64} height={64} borderRadius={32} />
                            <View>
                                <Skeleton width={100} height={20} borderRadius={4} style={{ marginBottom: 8 }} />
                                <Skeleton width={60} height={14} borderRadius={4} />
                            </View>
                        </View>
                        <View style={styles.heroFooter}>
                            <Skeleton width={80} height={30} borderRadius={4} />
                            <Skeleton width={100} height={36} borderRadius={18} />
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={[styles.quickActions, { padding: spacing.xl }]}>
                    {[1, 2, 3, 4].map((_, idx) => (
                        <View key={idx} style={styles.actionBtn}>
                            <Skeleton width={56} height={56} borderRadius={20} />
                            <Skeleton width={50} height={12} borderRadius={4} style={{ marginTop: 8 }} />
                        </View>
                    ))}
                </View>

                {/* This Month's Occasions */}
                <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.lg }}>
                    <Skeleton width={100} height={20} borderRadius={4} style={{ marginBottom: spacing.md }} />
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        {[1, 2, 3].map((_, idx) => (
                            <Skeleton key={idx} width={60} height={30} borderRadius={15} />
                        ))}
                    </View>
                </View>

                {/* AI Recommendations */}
                <View style={{ marginTop: 32, paddingHorizontal: spacing.xl }}>
                    <View style={styles.sectionHeader}>
                        <Skeleton width={150} height={20} borderRadius={4} />
                        <Skeleton width={50} height={14} borderRadius={4} />
                    </View>
                    <View style={{ flexDirection: 'row', gap: 16, marginTop: spacing.md }}>
                        {[1, 2].map((_, idx) => (
                            <View key={idx} style={styles.recCard}>
                                <Skeleton width={220} height={140} borderRadius={16} />
                                <View style={{ padding: 12, gap: 8 }}>
                                    <Skeleton width={120} height={16} borderRadius={4} />
                                    <Skeleton width={80} height={12} borderRadius={4} />
                                    <View style={styles.recFooter}>
                                        <Skeleton width={60} height={16} borderRadius={4} />
                                        <Skeleton width={40} height={12} borderRadius={4} />
                                    </View>
                                    <Skeleton width="100%" height={36} borderRadius={18} style={{ marginTop: 8 }} />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    heroCard: {
        padding: 24,
        borderRadius: 24,
        gap: 20,
    },
    heroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    heroFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    actionBtn: {
        alignItems: 'center',
        width: (width - 64) / 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recCard: {
        width: 220,
    },
    recFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
});
