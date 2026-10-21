import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

export default function ShopItemDetailSkeleton() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + moderateScale(10) }]}>
                <SkeletonPaper color={colors.surface} style={styles.headerButton}><Skeleton width={moderateScale(21)} height={moderateScale(21)} /></SkeletonPaper>
                <SkeletonPaper color={colors.lime} style={styles.catalog}><Skeleton width={moderateScale(96)} height={moderateScale(10)} /></SkeletonPaper>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <SkeletonPaper color={colors.surface} style={[styles.imagePaper, { }]}>
                    <Skeleton width="100%" height="100%" borderRadius={8} />
                    <View style={[styles.tape, { backgroundColor: colors.lemon, borderColor: colors.ink }]} />
                </SkeletonPaper>

                <View style={styles.titleBlock}>
                    <View style={styles.titleCopy}><Skeleton width={moderateScale(92)} height={moderateScale(10)} /><Skeleton width="88%" height={moderateScale(35)} /><Skeleton width="65%" height={moderateScale(35)} /></View>
                    <View style={[styles.price, { backgroundColor: colors.lemon, borderColor: colors.ink }]}><Skeleton width={moderateScale(48)} height={moderateScale(9)} /><Skeleton width={moderateScale(86)} height={moderateScale(23)} /></View>
                </View>

                <View style={[styles.maker, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                    <Skeleton width={moderateScale(48)} height={moderateScale(48)} borderRadius={16} />
                    <View style={styles.copy}><Skeleton width={moderateScale(91)} height={moderateScale(9)} /><Skeleton width="64%" height={moderateScale(16)} /><Skeleton width={moderateScale(105)} height={moderateScale(10)} /></View>
                    <Skeleton width={moderateScale(20)} height={moderateScale(20)} borderRadius={6} />
                </View>

                <View style={styles.bento}>
                    <View style={[styles.fact, { backgroundColor: colors.lilac, borderColor: colors.ink }]}><Skeleton width={moderateScale(38)} height={moderateScale(38)} borderRadius={12} /><Skeleton width={moderateScale(74)} height={moderateScale(10)} /><Skeleton width={moderateScale(86)} height={moderateScale(16)} /></View>
                    <View style={[styles.fact, { backgroundColor: colors.peach, borderColor: colors.ink }]}><Skeleton width={moderateScale(38)} height={moderateScale(38)} borderRadius={12} /><Skeleton width={moderateScale(62)} height={moderateScale(10)} /><Skeleton width={moderateScale(78)} height={moderateScale(16)} /></View>
                    <View style={[styles.factWide, { backgroundColor: colors.lemon, borderColor: colors.ink }]}><Skeleton width={moderateScale(38)} height={moderateScale(38)} borderRadius={12} /><View style={styles.copy}><Skeleton width={moderateScale(48)} height={moderateScale(10)} /><Skeleton width={moderateScale(92)} height={moderateScale(16)} /></View></View>
                </View>

                <SkeletonPaper color={colors.surface} style={[styles.story, { }]}>
                    <View style={styles.storyHeading}><Skeleton width={moderateScale(74)} height={moderateScale(10)} /><Skeleton width="66%" height={moderateScale(1)} borderRadius={1} /></View>
                    <Skeleton width="100%" height={moderateScale(13)} />
                    <Skeleton width="96%" height={moderateScale(13)} />
                    <Skeleton width="86%" height={moderateScale(13)} />
                    <Skeleton width="64%" height={moderateScale(13)} />
                    <Skeleton width={moderateScale(105)} height={moderateScale(30)} borderRadius={10} />
                </SkeletonPaper>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.ink, paddingBottom: Math.max(insets.bottom, moderateScale(12)) }]}>
                <View style={styles.copy}><Skeleton width={moderateScale(82)} height={moderateScale(9)} /><Skeleton width={moderateScale(75)} height={moderateScale(16)} /></View>
                <Skeleton width={moderateScale(190)} height={moderateScale(54)} borderRadius={16} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    header: { zIndex: 3, paddingHorizontal: moderateScale(20), paddingBottom: moderateScale(8), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerButton: { width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(14), alignItems: 'center', justifyContent: 'center' },
    catalog: { height: moderateScale(36), borderRadius: moderateScale(12), paddingHorizontal: moderateScale(13), justifyContent: 'center' },
    content: { paddingHorizontal: moderateScale(20), paddingTop: moderateScale(18), paddingBottom: moderateScale(126), gap: moderateScale(22) },
    imagePaper: { height: moderateScale(380), borderRadius: moderateScale(14), padding: moderateScale(9) },
    tape: { position: 'absolute', width: moderateScale(58), height: moderateScale(15), top: moderateScale(-8), left: '42%', borderWidth: 1, transform: [{ rotate: '-3deg' }] },
    titleBlock: { flexDirection: 'row', alignItems: 'flex-start', gap: moderateScale(12) },
    titleCopy: { flex: 1, gap: moderateScale(7) },
    price: { width: moderateScale(122), minHeight: moderateScale(82), borderWidth: 1.5, borderRadius: moderateScale(16), padding: moderateScale(12), justifyContent: 'center', gap: moderateScale(8), transform: [{ rotate: '3deg' }] },
    maker: { borderWidth: 1.5, borderRadius: moderateScale(20), padding: moderateScale(13), flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) },
    copy: { flex: 1, gap: moderateScale(6) },
    bento: { flexDirection: 'row', flexWrap: 'wrap', gap: moderateScale(11) },
    fact: { width: '48.3%', minHeight: moderateScale(118), borderWidth: 1.5, borderRadius: moderateScale(20), padding: moderateScale(13), justifyContent: 'space-between' },
    factWide: { width: '100%', minHeight: moderateScale(78), borderWidth: 1.5, borderRadius: moderateScale(20), padding: moderateScale(13), flexDirection: 'row', alignItems: 'center', gap: moderateScale(11) },
    story: { padding: moderateScale(18), gap: moderateScale(12) },
    storyHeading: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(10) },
    footer: { position: 'absolute', left: moderateScale(0), right: moderateScale(0), bottom: moderateScale(0), minHeight: moderateScale(86), paddingHorizontal: moderateScale(20), paddingTop: moderateScale(12), borderTopWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: moderateScale(14) },
});
