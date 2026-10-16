import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { EventTemplate } from '@/types';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowRight01Icon, Calendar01Icon, GiftIcon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import HolidaySubscribersSheet from '../sheets/HolidaySubscribersSheet';
import { BottomSheetRef } from '../ui/BottomSheetWrapper';

interface UpcomingHolidaysProps {
    templates: EventTemplate[] | undefined;
}

export default function UpcomingHolidays({ templates }: UpcomingHolidaysProps) {
    const { spacing, colors } = useTheme();
    const router = useRouter();
    const [selectedHoliday, setSelectedHoliday] = useState<EventTemplate | null>(null);
    const subscribersSheetRef = useRef<BottomSheetRef>(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextOccurrence = (template: EventTemplate) => {
        const date = new Date(today.getFullYear(), template.month - 1, template.day);
        if (date < today) date.setFullYear(date.getFullYear() + 1);
        return date;
    };

    const upcomingHolidays = [...(templates || [])]
        .sort((a, b) => nextOccurrence(a).getTime() - nextOccurrence(b).getTime())
        .slice(0, 5);

    const handleHolidayPress = (holiday: EventTemplate) => {
        setSelectedHoliday(holiday);
        subscribersSheetRef.current?.expand();
    };

    if (upcomingHolidays.length === 0) return null;

    const paperColors = [colors.lemon, colors.lilac, colors.mint, colors.peach];

    return (
        <View style={styles.section}>
            <View style={[styles.heading, { paddingHorizontal: spacing.xl }]}>
                <View style={{ flex: 1 }}>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE DATE LIBRARY</Typography>
                    <Typography variant="h2">Global moments</Typography>
                    <Typography variant="body" color={colors.textSecondary}>Shared celebrations worth remembering</Typography>
                </View>
                <Pressable
                    onPress={() => router.push('/global-events')}
                    style={[styles.seeAllPill, { backgroundColor: colors.surface, borderColor: colors.ink }]}
                >
                    <Typography variant="caption" style={styles.overline}>ALL</Typography>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={15} color={colors.ink} />
                </Pressable>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.tray, { paddingHorizontal: spacing.xl }]}
            >
                {upcomingHolidays.map((holiday, index) => (
                    <Pressable
                        key={holiday.id}
                        onPress={() => handleHolidayPress(holiday)}
                        style={({ pressed }) => [
                            styles.eventCard,
                            {
                                backgroundColor: paperColors[index % paperColors.length],
                                borderColor: colors.ink,
                                transform: [{ rotate: index % 2 ? '1deg' : '-1deg' }],
                            },
                            pressed && styles.pressed,
                        ]}
                    >
                        <View style={styles.cardTop}>
                            <View style={[styles.iconBox, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={GiftIcon} size={23} color={colors.ink} />
                            </View>
                            <View style={[styles.datePill, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={Calendar01Icon} size={13} color={colors.ink} />
                                <Typography variant="caption" style={styles.overline}>
                                    {nextOccurrence(holiday).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                                </Typography>
                            </View>
                        </View>
                        <View style={styles.cardCopy}>
                            <Typography variant="h4" numberOfLines={2}>{holiday.title}</Typography>
                            <Typography variant="caption" color={colors.textSecondary} numberOfLines={2}>
                                {holiday.description || `Celebrate ${holiday.title} with your favourite people.`}
                            </Typography>
                        </View>
                        <View style={styles.subscribeRow}>
                            <Typography variant="caption" style={styles.overline}>ADD PEOPLE</Typography>
                            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.ink} />
                        </View>
                    </Pressable>
                ))}
            </ScrollView>

            <HolidaySubscribersSheet
                ref={subscribersSheetRef}
                holiday={selectedHoliday}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    section: { marginTop: 38 },
    heading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 0.8 },
    seeAllPill: { height: 34, borderWidth: 1.25, borderRadius: 12, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 4 },
    tray: { gap: 14, paddingTop: 4, paddingBottom: 18 },
    eventCard: { width: 210, minHeight: 190, borderWidth: 1.5, borderRadius: 22, padding: 14, justifyContent: 'space-between' },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    iconBox: { width: 45, height: 45, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
    datePill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.25, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5 },
    cardCopy: { gap: 4, marginVertical: 13 },
    subscribeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    pressed: { opacity: 0.82, transform: [{ translateY: 2 }] },
});
