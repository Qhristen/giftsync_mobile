import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

export default function HomeScreenSkeleton() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const palette = [colors.lilac, colors.peach, colors.mint];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.headerShell, { paddingTop: insets.top + moderateScale(12) }]}>
                <View style={styles.header}>
                    <View style={styles.copy}><Skeleton width={moderateScale(128)} height={moderateScale(11)} /><Skeleton width={moderateScale(205)} height={moderateScale(31)} /></View>
                    <SkeletonPaper color={colors.surface} style={styles.headerButton}><Skeleton width={moderateScale(21)} height={moderateScale(21)} borderRadius={7} /></SkeletonPaper>
                </View>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <SkeletonPaper color={colors.surface} style={styles.moment}>
                    <View style={[styles.colorBlock, { backgroundColor: colors.lemon, borderColor: colors.ink }]} />
                    <View style={[styles.dateStamp, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                        <Skeleton width={moderateScale(34)} height={moderateScale(31)} /><Skeleton width={moderateScale(28)} height={moderateScale(10)} />
                    </View>
                    <View style={styles.momentCopy}>
                        <Skeleton width={moderateScale(134)} height={moderateScale(10)} />
                        <Skeleton width="72%" height={moderateScale(35)} />
                        <Skeleton width="48%" height={moderateScale(21)} />
                        <View style={styles.personRow}><Skeleton width={moderateScale(46)} height={moderateScale(46)} borderRadius={16} /><View style={styles.copy}><Skeleton width={moderateScale(68)} height={moderateScale(9)} /><Skeleton width={moderateScale(94)} height={moderateScale(15)} /></View></View>
                    </View>
                </SkeletonPaper>

                <View style={styles.label}><Skeleton width={moderateScale(104)} height={moderateScale(10)} /><Skeleton width={moderateScale(45)} height={moderateScale(2)} borderRadius={1} /></View>
                <View style={styles.bento}>
                    <SkeletonPaper color={colors.mint} style={styles.concierge}>
                        <Skeleton width={moderateScale(46)} height={moderateScale(46)} borderRadius={14} />
                        <View style={styles.bottomCopy}><Skeleton width="82%" height={moderateScale(21)} /><Skeleton width="65%" height={moderateScale(11)} /></View>
                    </SkeletonPaper>
                    <View style={styles.stack}>
                        <SkeletonPaper color={colors.peach} style={styles.smallTile}><View style={styles.copy}><Skeleton width={moderateScale(74)} height={moderateScale(14)} /><Skeleton width={moderateScale(86)} height={moderateScale(10)} /></View><Skeleton width={moderateScale(23)} height={moderateScale(23)} /></SkeletonPaper>
                        <SkeletonPaper color={colors.lilac} style={styles.smallTile}><View style={styles.copy}><Skeleton width={moderateScale(68)} height={moderateScale(14)} /><Skeleton width={moderateScale(72)} height={moderateScale(10)} /></View><Skeleton width={moderateScale(23)} height={moderateScale(23)} /></SkeletonPaper>
                    </View>
                </View>

                <View style={styles.sectionHeading}><View style={styles.copy}><Skeleton width={moderateScale(154)} height={moderateScale(24)} /><Skeleton width={moderateScale(204)} height={moderateScale(13)} /></View><Skeleton width={moderateScale(50)} height={moderateScale(29)} borderRadius={12} /></View>
                <View style={styles.timeline}>
                    <View style={[styles.timelineLine, { backgroundColor: colors.ink }]} />
                    {palette.map((color, index) => (
                        <View key={color} style={styles.timelineRow}>
                            <View style={[styles.dot, { backgroundColor: color, borderColor: colors.ink }]}><Skeleton width={moderateScale(12)} height={moderateScale(12)} borderRadius={6} /></View>
                            <SkeletonPaper color={colors.surface} style={[styles.timelineCard, { marginLeft: index % 2 ? moderateScale(12) : moderateScale(0) }]}>
                                <Skeleton width={moderateScale(62)} height={moderateScale(29)} borderRadius={9} />
                                <View style={styles.copy}><Skeleton width="65%" height={moderateScale(16)} /><Skeleton width="42%" height={moderateScale(10)} /></View>
                                <Skeleton width={moderateScale(18)} height={moderateScale(18)} borderRadius={6} />
                            </SkeletonPaper>
                        </View>
                    ))}
                </View>

                <View style={styles.sectionHeading}><View style={styles.copy}><Skeleton width={moderateScale(118)} height={moderateScale(10)} /><Skeleton width={moderateScale(185)} height={moderateScale(24)} /></View><Skeleton width={moderateScale(54)} height={moderateScale(13)} /></View>
                <View style={styles.polaroids}>
                    {palette.slice(0, 2).map((color, index) => (
                        <SkeletonPaper key={color} color={colors.surface} style={[styles.polaroid, { transform: [{ rotate: index ? '2deg' : '-2deg' }] }]}>
                            <Skeleton width="100%" height={moderateScale(132)} borderRadius={7} />
                            <Skeleton width="77%" height={moderateScale(16)} />
                            <View style={styles.polaroidFooter}><Skeleton width={moderateScale(76)} height={moderateScale(10)} /><Skeleton width={moderateScale(55)} height={moderateScale(13)} /></View>
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
    content: { paddingHorizontal: moderateScale(20), paddingTop: moderateScale(22), paddingBottom: moderateScale(120), gap: moderateScale(22) },
    headerShell: { paddingHorizontal: moderateScale(20), paddingBottom: moderateScale(12) },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    copy: { flex: 1, gap: moderateScale(7) },
    headerButton: { width: moderateScale(48), height: moderateScale(48), alignItems: 'center', justifyContent: 'center', borderRadius: moderateScale(15) },
    moment: { minHeight: moderateScale(250), overflow: 'hidden', flexDirection: 'row', padding: moderateScale(18) },
    colorBlock: { position: 'absolute', top: moderateScale(0), bottom: moderateScale(0), left: moderateScale(0), width: '28%', borderRightWidth: 1.5 },
    dateStamp: { width: moderateScale(76), height: moderateScale(106), borderWidth: 1.5, borderRadius: moderateScale(18), alignItems: 'center', justifyContent: 'center', gap: moderateScale(5), transform: [{ rotate: '-4deg' }] },
    momentCopy: { flex: 1, justifyContent: 'center', gap: moderateScale(9), marginLeft: moderateScale(18) },
    personRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(9), marginTop: moderateScale(10) },
    label: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(9) },
    bento: { flexDirection: 'row', minHeight: moderateScale(210), gap: moderateScale(12) },
    concierge: { flex: 1.12, padding: moderateScale(15), justifyContent: 'space-between' },
    bottomCopy: { gap: moderateScale(8) },
    stack: { flex: 1, gap: moderateScale(12) },
    smallTile: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: moderateScale(13), gap: moderateScale(8) },
    sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: moderateScale(12), marginTop: moderateScale(4) },
    timeline: { gap: moderateScale(12), position: 'relative' },
    timelineLine: { position: 'absolute', left: moderateScale(17), top: moderateScale(18), bottom: moderateScale(18), width: moderateScale(2) },
    timelineRow: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
    dot: { width: moderateScale(36), height: moderateScale(36), borderRadius: moderateScale(12), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    timelineCard: { flex: 1, minHeight: moderateScale(74), flexDirection: 'row', alignItems: 'center', padding: moderateScale(12), gap: moderateScale(10) },
    polaroids: { flexDirection: 'row', gap: moderateScale(16) },
    polaroid: { width: moderateScale(190), padding: moderateScale(9), gap: moderateScale(9), borderRadius: moderateScale(9) },
    polaroidFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
