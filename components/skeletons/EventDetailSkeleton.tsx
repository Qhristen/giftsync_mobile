import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

export default function EventDetailSkeleton() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const steps = [colors.mint, colors.lilac, colors.peach];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.headerShell, { paddingTop: insets.top + moderateScale(10) }]}>
                <View style={styles.header}>
                    <SkeletonPaper color={colors.surface} style={styles.headerButton}><Skeleton width={moderateScale(21)} height={moderateScale(21)} /></SkeletonPaper>
                    <SkeletonPaper color={colors.lime} style={styles.dossier}><Skeleton width={moderateScale(122)} height={moderateScale(10)} /></SkeletonPaper>
                    <SkeletonPaper color={colors.lilac} style={styles.headerButton}><Skeleton width={moderateScale(21)} height={moderateScale(21)} /></SkeletonPaper>
                </View>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <SkeletonPaper color={colors.surface} style={styles.cover}>
                    <View style={[styles.band, { backgroundColor: colors.lemon, borderColor: colors.ink }]} />
                    <View style={[styles.datePoster, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                        <Skeleton width={moderateScale(47)} height={moderateScale(9)} /><Skeleton width={moderateScale(42)} height={moderateScale(43)} /><Skeleton width={moderateScale(50)} height={moderateScale(9)} />
                    </View>
                    <View style={styles.coverCopy}>
                        <Skeleton width="62%" height={moderateScale(10)} />
                        <Skeleton width="86%" height={moderateScale(38)} />
                        <View style={styles.person}><Skeleton width={moderateScale(52)} height={moderateScale(52)} borderRadius={18} /><View style={styles.copy}><Skeleton width={moderateScale(78)} height={moderateScale(9)} /><Skeleton width={moderateScale(98)} height={moderateScale(15)} /></View></View>
                    </View>
                    <View style={[styles.tape, { backgroundColor: colors.lilac, borderColor: colors.ink }]} />
                </SkeletonPaper>

                <View style={styles.label}><Skeleton width={moderateScale(112)} height={moderateScale(10)} /><Skeleton width="60%" height={moderateScale(1)} borderRadius={1} /></View>
                <View style={styles.trail}>
                    <View style={[styles.trailLine, { backgroundColor: colors.ink }]} />
                    {steps.map((color) => (
                        <View key={color} style={styles.trailRow}>
                            <View style={[styles.trailDot, { backgroundColor: color, borderColor: colors.ink }]}><Skeleton width={moderateScale(18)} height={moderateScale(18)} borderRadius={6} /></View>
                            <View style={[styles.trailCard, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <View style={styles.copy}><Skeleton width="51%" height={moderateScale(15)} /><Skeleton width="82%" height={moderateScale(11)} /></View>
                                <Skeleton width={moderateScale(31)} height={moderateScale(10)} />
                            </View>
                        </View>
                    ))}
                </View>

                <SkeletonPaper color={colors.mint} style={styles.mission}>
                    <Skeleton width={moderateScale(52)} height={moderateScale(52)} borderRadius={17} />
                    <View style={styles.copy}><Skeleton width={moderateScale(105)} height={moderateScale(9)} /><Skeleton width="88%" height={moderateScale(20)} /><Skeleton width="72%" height={moderateScale(11)} /></View>
                    <Skeleton width={moderateScale(42)} height={moderateScale(42)} borderRadius={13} />
                </SkeletonPaper>

                <View style={styles.conciergeRow}>
                    <View style={[styles.concierge, { backgroundColor: colors.peach, borderColor: colors.ink }]}><Skeleton width={moderateScale(23)} height={moderateScale(23)} /><View style={styles.copy}><Skeleton width="75%" height={moderateScale(14)} /><Skeleton width="50%" height={moderateScale(10)} /></View></View>
                    <View style={[styles.edit, { backgroundColor: colors.lemon, borderColor: colors.ink }]}><Skeleton width={moderateScale(23)} height={moderateScale(23)} /><Skeleton width={moderateScale(58)} height={moderateScale(10)} /></View>
                </View>

                <View style={styles.sectionHeading}><View style={styles.copy}><Skeleton width={moderateScale(92)} height={moderateScale(10)} /><Skeleton width={moderateScale(176)} height={moderateScale(24)} /></View><Skeleton width={moderateScale(46)} height={moderateScale(13)} /></View>
                <View style={styles.ideas}>
                    {steps.slice(0, 2).map((color, index) => (
                        <SkeletonPaper key={color} color={colors.surface} style={[styles.idea, { transform: [{ rotate: index ? '2deg' : '-2deg' }] }]}>
                            <Skeleton width="100%" height={moderateScale(144)} borderRadius={4} />
                            <Skeleton width="74%" height={moderateScale(16)} />
                            <View style={styles.ideaFooter}><Skeleton width={moderateScale(60)} height={moderateScale(14)} /><Skeleton width={moderateScale(34)} height={moderateScale(12)} /></View>
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
    content: { paddingHorizontal: moderateScale(20), paddingTop: moderateScale(20), paddingBottom: moderateScale(80), gap: moderateScale(20) },
    headerShell: { zIndex: 2, paddingHorizontal: moderateScale(20), paddingBottom: moderateScale(5) },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerButton: { width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(14), alignItems: 'center', justifyContent: 'center' },
    dossier: { height: moderateScale(36), borderRadius: moderateScale(12), paddingHorizontal: moderateScale(13), alignItems: 'center', justifyContent: 'center' },
    cover: { overflow: 'hidden', flexDirection: 'row', padding: moderateScale(22) },
    band: { position: 'absolute', left: moderateScale(0), top: moderateScale(0), bottom: moderateScale(0), width: '29%', borderRightWidth: 1.5 },
    datePoster: { width: moderateScale(88), height: moderateScale(126), borderWidth: 1.5, borderRadius: moderateScale(19), alignItems: 'center', justifyContent: 'center', gap: moderateScale(5), marginTop: moderateScale(8), transform: [{ rotate: '-4deg' }] },
    coverCopy: { flex: 1, justifyContent: 'center', gap: moderateScale(8), marginLeft: moderateScale(18) },
    person: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(10), marginTop: moderateScale(20) },
    copy: { flex: 1, gap: moderateScale(7) },
    tape: { position: 'absolute', width: moderateScale(58), height: moderateScale(16), borderWidth: 1, top: moderateScale(-7), right: moderateScale(36), transform: [{ rotate: '4deg' }] },
    label: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(10), marginTop: moderateScale(7) },
    trail: { position: 'relative', gap: moderateScale(10) },
    trailLine: { position: 'absolute', left: moderateScale(21), top: moderateScale(22), bottom: moderateScale(22), width: moderateScale(2) },
    trailRow: { minHeight: moderateScale(76), flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
    trailDot: { width: moderateScale(44), height: moderateScale(44), borderWidth: 1.5, borderRadius: moderateScale(14), alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    trailCard: { flex: 1, minHeight: moderateScale(68), borderWidth: 1.5, borderRadius: moderateScale(17), padding: moderateScale(12), flexDirection: 'row', alignItems: 'center', gap: moderateScale(8) },
    mission: { minHeight: moderateScale(116), padding: moderateScale(14), flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
    conciergeRow: { flexDirection: 'row', gap: moderateScale(11) },
    concierge: { flex: 1, minHeight: moderateScale(84), borderWidth: 1.5, borderRadius: moderateScale(18), padding: moderateScale(12), flexDirection: 'row', alignItems: 'center', gap: moderateScale(9) },
    edit: { width: moderateScale(98), minHeight: moderateScale(84), borderWidth: 1.5, borderRadius: moderateScale(18), padding: moderateScale(10), alignItems: 'center', justifyContent: 'center', gap: moderateScale(7) },
    sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: moderateScale(10), marginTop: moderateScale(5) },
    ideas: { flexDirection: 'row', gap: moderateScale(17) },
    idea: { width: moderateScale(192), padding: moderateScale(9), gap: moderateScale(9), borderRadius: moderateScale(9) },
    ideaFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
