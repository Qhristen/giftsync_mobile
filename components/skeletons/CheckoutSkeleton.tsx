import CheckoutProgress from '@/components/checkout/CheckoutProgress';
import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Skeleton, { SkeletonPaper } from './Skeleton';
import { moderateScale } from '@/utils/scaling';

interface CheckoutSkeletonProps {
    step: 1 | 2 | 3 | 4;
    onBack?: () => void;
}

const TITLES = ['Check the gift brief', 'Plot the delivery route', 'Choose how to pay', 'Gift dispatched!'];
const EYEBROWS = ['Gift check', 'Delivery map', 'Checkout till', 'All wrapped up'];

export default function CheckoutSkeleton({ step, onBack }: CheckoutSkeletonProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <CheckoutProgress
                step={step}
                eyebrow={EYEBROWS[step - 1]}
                title={TITLES[step - 1]}
                onBack={step === 4 ? undefined : onBack}
            />
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <SkeletonPaper color={step === 2 ? colors.mint : colors.lemon} style={styles.hero}>
                    <View style={styles.heroRow}>
                        <Skeleton width={moderateScale(68)} height={moderateScale(68)} borderRadius={20} />
                        <View style={styles.copy}>
                            <Skeleton width="45%" height={moderateScale(11)} />
                            <Skeleton width="78%" height={moderateScale(25)} />
                            <Skeleton width="60%" height={moderateScale(13)} />
                        </View>
                    </View>
                    <Skeleton width="100%" height={step === 1 ? moderateScale(130) : moderateScale(54)} borderRadius={16} />
                </SkeletonPaper>

                <View style={styles.labelRow}>
                    <Skeleton width={moderateScale(90)} height={moderateScale(12)} />
                    <Skeleton width={moderateScale(48)} height={moderateScale(12)} />
                </View>

                <SkeletonPaper color={colors.surface} style={styles.ticket}>
                    <View style={styles.ticketRow}>
                        <Skeleton width={moderateScale(44)} height={moderateScale(44)} borderRadius={14} />
                        <View style={styles.copy}>
                            <Skeleton width="36%" height={moderateScale(10)} />
                            <Skeleton width="86%" height={moderateScale(17)} />
                            <Skeleton width="66%" height={moderateScale(12)} />
                        </View>
                    </View>
                    <View style={[styles.dash, { borderColor: colors.textMuted }]} />
                    <View style={styles.ticketRow}>
                        <Skeleton width="42%" height={moderateScale(48)} borderRadius={14} />
                        <Skeleton width="52%" height={moderateScale(48)} borderRadius={14} />
                    </View>
                </SkeletonPaper>

                <SkeletonPaper color={colors.lavender} style={styles.receipt}>
                    {[0, 1, 2].map((item) => (
                        <View key={item} style={styles.receiptRow}>
                            <Skeleton width={item === 2 ? '44%' : '32%'} height={moderateScale(13)} />
                            <Skeleton width={item === 2 ? '34%' : '22%'} height={moderateScale(13)} />
                        </View>
                    ))}
                </SkeletonPaper>
            </ScrollView>
            <View style={styles.footer}>
                <Skeleton width="100%" height={moderateScale(58)} borderRadius={18} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingHorizontal: moderateScale(20),
        paddingTop: moderateScale(8),
        paddingBottom: moderateScale(140),
        gap: moderateScale(18),
    },
    hero: {
        padding: moderateScale(18),
        gap: moderateScale(18),
        transform: [{ rotate: '-1deg' }],
    },
    heroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(14),
    },
    copy: {
        flex: 1,
        gap: moderateScale(8),
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    ticket: {
        padding: moderateScale(18),
        gap: moderateScale(16),
    },
    ticketRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(12),
    },
    dash: {
        borderTopWidth: 1,
        borderStyle: 'dashed',
    },
    receipt: {
        padding: moderateScale(18),
        gap: moderateScale(13),
        transform: [{ rotate: '1deg' }],
    },
    receiptRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footer: {
        position: 'absolute',
        left: moderateScale(0),
        right: moderateScale(0),
        bottom: moderateScale(0),
        paddingHorizontal: moderateScale(20),
        paddingTop: moderateScale(14),
        paddingBottom: moderateScale(26),
    },
});
