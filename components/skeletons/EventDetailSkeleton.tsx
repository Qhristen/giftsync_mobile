import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton, { SkeletonPaper } from './Skeleton';

export default function EventDetailSkeleton() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const steps = [colors.mint, colors.lilac, colors.peach];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.headerShell, { paddingTop: insets.top + 10 }]}>
                <View style={styles.header}>
                    <SkeletonPaper color={colors.surface} style={styles.headerButton}><Skeleton width={21} height={21} /></SkeletonPaper>
                    <SkeletonPaper color={colors.lime} style={styles.dossier}><Skeleton width={122} height={10} /></SkeletonPaper>
                    <SkeletonPaper color={colors.lilac} style={styles.headerButton}><Skeleton width={21} height={21} /></SkeletonPaper>
                </View>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <SkeletonPaper color={colors.surface} style={styles.cover}>
                    <View style={[styles.band, { backgroundColor: colors.lemon, borderColor: colors.ink }]} />
                    <View style={[styles.datePoster, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                        <Skeleton width={47} height={9} /><Skeleton width={42} height={43} /><Skeleton width={50} height={9} />
                    </View>
                    <View style={styles.coverCopy}>
                        <Skeleton width="62%" height={10} />
                        <Skeleton width="86%" height={38} />
                        <View style={styles.person}><Skeleton width={52} height={52} borderRadius={18} /><View style={styles.copy}><Skeleton width={78} height={9} /><Skeleton width={98} height={15} /></View></View>
                    </View>
                    <View style={[styles.tape, { backgroundColor: colors.lilac, borderColor: colors.ink }]} />
                </SkeletonPaper>

                <View style={styles.label}><Skeleton width={112} height={10} /><Skeleton width="60%" height={1} borderRadius={1} /></View>
                <View style={styles.trail}>
                    <View style={[styles.trailLine, { backgroundColor: colors.ink }]} />
                    {steps.map((color) => (
                        <View key={color} style={styles.trailRow}>
                            <View style={[styles.trailDot, { backgroundColor: color, borderColor: colors.ink }]}><Skeleton width={18} height={18} borderRadius={6} /></View>
                            <View style={[styles.trailCard, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <View style={styles.copy}><Skeleton width="51%" height={15} /><Skeleton width="82%" height={11} /></View>
                                <Skeleton width={31} height={10} />
                            </View>
                        </View>
                    ))}
                </View>

                <SkeletonPaper color={colors.mint} style={styles.mission}>
                    <Skeleton width={52} height={52} borderRadius={17} />
                    <View style={styles.copy}><Skeleton width={105} height={9} /><Skeleton width="88%" height={20} /><Skeleton width="72%" height={11} /></View>
                    <Skeleton width={42} height={42} borderRadius={13} />
                </SkeletonPaper>

                <View style={styles.conciergeRow}>
                    <View style={[styles.concierge, { backgroundColor: colors.peach, borderColor: colors.ink }]}><Skeleton width={23} height={23} /><View style={styles.copy}><Skeleton width="75%" height={14} /><Skeleton width="50%" height={10} /></View></View>
                    <View style={[styles.edit, { backgroundColor: colors.lemon, borderColor: colors.ink }]}><Skeleton width={23} height={23} /><Skeleton width={58} height={10} /></View>
                </View>

                <View style={styles.sectionHeading}><View style={styles.copy}><Skeleton width={92} height={10} /><Skeleton width={176} height={24} /></View><Skeleton width={46} height={13} /></View>
                <View style={styles.ideas}>
                    {steps.slice(0, 2).map((color, index) => (
                        <SkeletonPaper key={color} color={colors.surface} style={[styles.idea, { transform: [{ rotate: index ? '2deg' : '-2deg' }] }]}>
                            <Skeleton width="100%" height={144} borderRadius={4} />
                            <Skeleton width="74%" height={16} />
                            <View style={styles.ideaFooter}><Skeleton width={60} height={14} /><Skeleton width={34} height={12} /></View>
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
    content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80, gap: 20 },
    headerShell: { zIndex: 2, paddingHorizontal: 20, paddingBottom: 5 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    dossier: { height: 36, borderRadius: 12, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center' },
    cover: { minHeight: 292, overflow: 'hidden', flexDirection: 'row', padding: 22 },
    band: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '29%', borderRightWidth: 1.5 },
    datePoster: { width: 88, height: 126, borderWidth: 1.5, borderRadius: 19, alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 8, transform: [{ rotate: '-4deg' }] },
    coverCopy: { flex: 1, justifyContent: 'center', gap: 8, marginLeft: 18 },
    person: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 },
    copy: { flex: 1, gap: 7 },
    tape: { position: 'absolute', width: 58, height: 16, borderWidth: 1, top: -7, right: 36, transform: [{ rotate: '4deg' }] },
    label: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 7 },
    trail: { position: 'relative', gap: 10 },
    trailLine: { position: 'absolute', left: 21, top: 22, bottom: 22, width: 2 },
    trailRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12 },
    trailDot: { width: 44, height: 44, borderWidth: 1.5, borderRadius: 14, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    trailCard: { flex: 1, minHeight: 68, borderWidth: 1.5, borderRadius: 17, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
    mission: { minHeight: 116, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    conciergeRow: { flexDirection: 'row', gap: 11 },
    concierge: { flex: 1, minHeight: 84, borderWidth: 1.5, borderRadius: 18, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
    edit: { width: 98, minHeight: 84, borderWidth: 1.5, borderRadius: 18, padding: 10, alignItems: 'center', justifyContent: 'center', gap: 7 },
    sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, marginTop: 5 },
    ideas: { flexDirection: 'row', gap: 17 },
    idea: { width: 192, padding: 9, gap: 9, borderRadius: 9 },
    ideaFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
