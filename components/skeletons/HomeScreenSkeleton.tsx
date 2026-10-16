import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton, { SkeletonPaper } from './Skeleton';

export default function HomeScreenSkeleton() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const palette = [colors.lilac, colors.peach, colors.mint];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.headerShell, { paddingTop: insets.top + 12 }]}>
                <View style={styles.header}>
                    <View style={styles.copy}><Skeleton width={128} height={11} /><Skeleton width={205} height={31} /></View>
                    <SkeletonPaper color={colors.surface} style={styles.headerButton}><Skeleton width={21} height={21} borderRadius={7} /></SkeletonPaper>
                </View>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <SkeletonPaper color={colors.surface} style={styles.moment}>
                    <View style={[styles.colorBlock, { backgroundColor: colors.lemon, borderColor: colors.ink }]} />
                    <View style={[styles.dateStamp, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                        <Skeleton width={34} height={31} /><Skeleton width={28} height={10} />
                    </View>
                    <View style={styles.momentCopy}>
                        <Skeleton width={134} height={10} />
                        <Skeleton width="72%" height={35} />
                        <Skeleton width="48%" height={21} />
                        <View style={styles.personRow}><Skeleton width={46} height={46} borderRadius={16} /><View style={styles.copy}><Skeleton width={68} height={9} /><Skeleton width={94} height={15} /></View></View>
                    </View>
                </SkeletonPaper>

                <View style={styles.label}><Skeleton width={104} height={10} /><Skeleton width={45} height={2} borderRadius={1} /></View>
                <View style={styles.bento}>
                    <SkeletonPaper color={colors.mint} style={styles.concierge}>
                        <Skeleton width={46} height={46} borderRadius={14} />
                        <View style={styles.bottomCopy}><Skeleton width="82%" height={21} /><Skeleton width="65%" height={11} /></View>
                    </SkeletonPaper>
                    <View style={styles.stack}>
                        <SkeletonPaper color={colors.peach} style={styles.smallTile}><View style={styles.copy}><Skeleton width={74} height={14} /><Skeleton width={86} height={10} /></View><Skeleton width={23} height={23} /></SkeletonPaper>
                        <SkeletonPaper color={colors.lilac} style={styles.smallTile}><View style={styles.copy}><Skeleton width={68} height={14} /><Skeleton width={72} height={10} /></View><Skeleton width={23} height={23} /></SkeletonPaper>
                    </View>
                </View>

                <View style={styles.sectionHeading}><View style={styles.copy}><Skeleton width={154} height={24} /><Skeleton width={204} height={13} /></View><Skeleton width={50} height={29} borderRadius={12} /></View>
                <View style={styles.timeline}>
                    <View style={[styles.timelineLine, { backgroundColor: colors.ink }]} />
                    {palette.map((color, index) => (
                        <View key={color} style={styles.timelineRow}>
                            <View style={[styles.dot, { backgroundColor: color, borderColor: colors.ink }]}><Skeleton width={12} height={12} borderRadius={6} /></View>
                            <SkeletonPaper color={colors.surface} style={[styles.timelineCard, { marginLeft: index % 2 ? 12 : 0 }]}>
                                <Skeleton width={62} height={29} borderRadius={9} />
                                <View style={styles.copy}><Skeleton width="65%" height={16} /><Skeleton width="42%" height={10} /></View>
                                <Skeleton width={18} height={18} borderRadius={6} />
                            </SkeletonPaper>
                        </View>
                    ))}
                </View>

                <View style={styles.sectionHeading}><View style={styles.copy}><Skeleton width={118} height={10} /><Skeleton width={185} height={24} /></View><Skeleton width={54} height={13} /></View>
                <View style={styles.polaroids}>
                    {palette.slice(0, 2).map((color, index) => (
                        <SkeletonPaper key={color} color={colors.surface} style={[styles.polaroid, { transform: [{ rotate: index ? '2deg' : '-2deg' }] }]}>
                            <Skeleton width="100%" height={132} borderRadius={7} />
                            <Skeleton width="77%" height={16} />
                            <View style={styles.polaroidFooter}><Skeleton width={76} height={10} /><Skeleton width={55} height={13} /></View>
                        </SkeletonPaper>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    content: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 120, gap: 22 },
    headerShell: { paddingHorizontal: 20, paddingBottom: 12 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    copy: { flex: 1, gap: 7 },
    headerButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
    moment: { minHeight: 250, overflow: 'hidden', flexDirection: 'row', padding: 18 },
    colorBlock: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '28%', borderRightWidth: 1.5 },
    dateStamp: { width: 76, height: 106, borderWidth: 1.5, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 5, transform: [{ rotate: '-4deg' }] },
    momentCopy: { flex: 1, justifyContent: 'center', gap: 9, marginLeft: 18 },
    personRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 10 },
    label: { flexDirection: 'row', alignItems: 'center', gap: 9 },
    bento: { flexDirection: 'row', minHeight: 210, gap: 12 },
    concierge: { flex: 1.12, padding: 15, justifyContent: 'space-between' },
    bottomCopy: { gap: 8 },
    stack: { flex: 1, gap: 12 },
    smallTile: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 13, gap: 8 },
    sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 4 },
    timeline: { gap: 12, position: 'relative' },
    timelineLine: { position: 'absolute', left: 17, top: 18, bottom: 18, width: 2 },
    timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dot: { width: 36, height: 36, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    timelineCard: { flex: 1, minHeight: 74, flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
    polaroids: { flexDirection: 'row', gap: 16 },
    polaroid: { width: 190, padding: 9, gap: 9, borderRadius: 9 },
    polaroidFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
