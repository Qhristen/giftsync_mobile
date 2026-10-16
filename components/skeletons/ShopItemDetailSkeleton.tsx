import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Skeleton, { SkeletonPaper } from './Skeleton';

export default function ShopItemDetailSkeleton() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <SkeletonPaper color={colors.surface} style={styles.headerButton}><Skeleton width={21} height={21} /></SkeletonPaper>
                <SkeletonPaper color={colors.lime} style={styles.catalog}><Skeleton width={96} height={10} /></SkeletonPaper>
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <SkeletonPaper color={colors.surface} style={[styles.imagePaper, { }]}>
                    <Skeleton width="100%" height="100%" borderRadius={8} />
                    <View style={[styles.tape, { backgroundColor: colors.lemon, borderColor: colors.ink }]} />
                </SkeletonPaper>

                <View style={styles.titleBlock}>
                    <View style={styles.titleCopy}><Skeleton width={92} height={10} /><Skeleton width="88%" height={35} /><Skeleton width="65%" height={35} /></View>
                    <View style={[styles.price, { backgroundColor: colors.lemon, borderColor: colors.ink }]}><Skeleton width={48} height={9} /><Skeleton width={86} height={23} /></View>
                </View>

                <View style={[styles.maker, { backgroundColor: colors.mint, borderColor: colors.ink }]}>
                    <Skeleton width={48} height={48} borderRadius={16} />
                    <View style={styles.copy}><Skeleton width={91} height={9} /><Skeleton width="64%" height={16} /><Skeleton width={105} height={10} /></View>
                    <Skeleton width={20} height={20} borderRadius={6} />
                </View>

                <View style={styles.bento}>
                    <View style={[styles.fact, { backgroundColor: colors.lilac, borderColor: colors.ink }]}><Skeleton width={38} height={38} borderRadius={12} /><Skeleton width={74} height={10} /><Skeleton width={86} height={16} /></View>
                    <View style={[styles.fact, { backgroundColor: colors.peach, borderColor: colors.ink }]}><Skeleton width={38} height={38} borderRadius={12} /><Skeleton width={62} height={10} /><Skeleton width={78} height={16} /></View>
                    <View style={[styles.factWide, { backgroundColor: colors.lemon, borderColor: colors.ink }]}><Skeleton width={38} height={38} borderRadius={12} /><View style={styles.copy}><Skeleton width={48} height={10} /><Skeleton width={92} height={16} /></View></View>
                </View>

                <SkeletonPaper color={colors.surface} style={[styles.story, { }]}>
                    <View style={styles.storyHeading}><Skeleton width={74} height={10} /><Skeleton width="66%" height={1} borderRadius={1} /></View>
                    <Skeleton width="100%" height={13} />
                    <Skeleton width="96%" height={13} />
                    <Skeleton width="86%" height={13} />
                    <Skeleton width="64%" height={13} />
                    <Skeleton width={105} height={30} borderRadius={10} />
                </SkeletonPaper>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderColor: colors.ink, paddingBottom: Math.max(insets.bottom, 12) }]}>
                <View style={styles.copy}><Skeleton width={82} height={9} /><Skeleton width={75} height={16} /></View>
                <Skeleton width={190} height={54} borderRadius={16} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scroll: { flex: 1 },
    header: { zIndex: 3, paddingHorizontal: 20, paddingBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    catalog: { height: 36, borderRadius: 12, paddingHorizontal: 13, justifyContent: 'center' },
    content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 126, gap: 22 },
    imagePaper: { height: 380, borderRadius: 14, padding: 9 },
    tape: { position: 'absolute', width: 58, height: 15, top: -8, left: '42%', borderWidth: 1, transform: [{ rotate: '-3deg' }] },
    titleBlock: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    titleCopy: { flex: 1, gap: 7 },
    price: { width: 122, minHeight: 82, borderWidth: 1.5, borderRadius: 16, padding: 12, justifyContent: 'center', gap: 8, transform: [{ rotate: '3deg' }] },
    maker: { borderWidth: 1.5, borderRadius: 20, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12 },
    copy: { flex: 1, gap: 6 },
    bento: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
    fact: { width: '48.3%', minHeight: 118, borderWidth: 1.5, borderRadius: 20, padding: 13, justifyContent: 'space-between' },
    factWide: { width: '100%', minHeight: 78, borderWidth: 1.5, borderRadius: 20, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
    story: { padding: 18, gap: 12 },
    storyHeading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    footer: { position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: 86, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 },
});
