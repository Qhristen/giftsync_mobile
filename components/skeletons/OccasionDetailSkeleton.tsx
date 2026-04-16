import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import Skeleton from './Skeleton';

const { width } = Dimensions.get('window');

export default function OccasionDetailSkeleton() {
    const { colors, spacing } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Header Area */}
                <View style={[styles.headerBg, { backgroundColor: colors.surfaceRaised }]}>
                    <View style={[styles.header, { top: spacing.xl, paddingHorizontal: spacing.xl }]}>
                        <Skeleton width={40} height={40} borderRadius={20} />
                        <Skeleton width={150} height={24} borderRadius={4} />
                        <Skeleton width={40} height={40} borderRadius={20} />
                    </View>

                    <View style={styles.heroContent}>
                        <Skeleton width={80} height={80} borderRadius={40} />
                        <Skeleton width={120} height={32} borderRadius={4} style={{ marginTop: 16 }} />
                        <Skeleton width={80} height={24} borderRadius={12} style={{ marginTop: 8 }} />
                    </View>
                </View>

                <View style={[styles.content, { padding: spacing.xl }]}>
                    {/* Premium Occasion Summary Card */}
                    <View style={[styles.premiumCard, { backgroundColor: colors.surfaceRaised }]}>
                        <View style={styles.detailRow}>
                            <Skeleton width={48} height={48} borderRadius={24} />
                            <View style={{ flex: 1, marginLeft: 16, gap: 4 }}>
                                <Skeleton width="40%" height={12} borderRadius={4} />
                                <Skeleton width="70%" height={24} borderRadius={4} />
                                <Skeleton width="30%" height={16} borderRadius={4} />
                            </View>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.detailRow}>
                            <Skeleton width={48} height={48} borderRadius={24} />
                            <View style={{ flex: 1, marginLeft: 16, gap: 4 }}>
                                <Skeleton width="40%" height={12} borderRadius={4} />
                                <Skeleton width="100%" height={16} borderRadius={4} />
                                <Skeleton width="80%" height={16} borderRadius={4} />
                            </View>
                        </View>
                    </View>

                    {/* Premium Action Banner */}
                    <View style={{ marginTop: 32, gap: 16 }}>
                        <Skeleton width={200} height={28} borderRadius={4} />
                        <Skeleton width="100%" height={200} borderRadius={24} />
                    </View>

                    {/* Recommendations */}
                    <View style={[styles.sectionHeader, { paddingTop: spacing['4xl'] }]}>
                        <Skeleton width={150} height={24} borderRadius={4} />
                        <Skeleton width={60} height={16} borderRadius={4} />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 16, paddingTop: spacing.md }}>
                        {[1, 2].map((_, idx) => (
                            <View key={idx} style={styles.recCard}>
                                <Skeleton width={220} height={140} borderRadius={0} />
                                <View style={{ padding: 12, gap: 8 }}>
                                    <Skeleton width={150} height={16} borderRadius={4} />
                                    <Skeleton width={80} height={12} borderRadius={4} />
                                    <View style={styles.recFooter}>
                                        <Skeleton width={60} height={16} borderRadius={4} />
                                        <Skeleton width={40} height={12} borderRadius={4} />
                                    </View>
                                    <Skeleton width="100%" height={36} borderRadius={18} style={{ marginTop: 12 }} />
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
    },
    headerBg: {
        paddingTop: 60,
        paddingBottom: 40,
    },
    header: {
        position: 'absolute',
        zIndex: 10,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
    },
    heroContent: {
        alignItems: 'center',
        marginTop: 60,
    },
    content: {
        marginTop: -30,
    },
    premiumCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginTop: 60,
    },
    detailRow: {
        flexDirection: 'row',
        padding: 24,
        alignItems: 'center',
    },
    divider: {
        height: 1,
        width: '100%',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recCard: {
        width: 220,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    recFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
});
