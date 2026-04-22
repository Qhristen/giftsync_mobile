import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { OccasionTemplate } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import HolidaySubscribersSheet from '../sheets/HolidaySubscribersSheet';
import { BottomSheetRef } from '../ui/BottomSheetWrapper';

interface UpcomingHolidaysProps {
    templates: OccasionTemplate[] | undefined;
}

export default function UpcomingHolidays({ templates }: UpcomingHolidaysProps) {
    const { spacing, colors } = useTheme();
    const router = useRouter();
    const [selectedHoliday, setSelectedHoliday] = useState<OccasionTemplate | null>(null);
    const subscribersSheetRef = useRef<BottomSheetRef>(null);

    const today = new Date();
    const currentMonth = today.getMonth() + 1;

    const upcomingHolidays = templates?.filter(template => {
        // Check if the template fall within the next 2 months from current date
        const templateDate = new Date(today.getFullYear(), template.month - 1, template.day);
        if (template.month < currentMonth) {
            templateDate.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = templateDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays >= 0 && diffDays <= 60;
    }).sort((a, b) => {
        const dateA = new Date(2024, a.month - 1, a.day);
        const dateB = new Date(2024, b.month - 1, b.day);
        return dateA.getTime() - dateB.getTime();
    });

    const handleHolidayPress = (holiday: OccasionTemplate) => {
        setSelectedHoliday(holiday);
        subscribersSheetRef.current?.expand();
    };

    if (!upcomingHolidays || upcomingHolidays.length === 0) return null;

    return (
        <View>
            <Animated.View entering={FadeInDown.delay(500).duration(600)} style={{ paddingVertical: spacing.md }}>
                <View style={{ paddingHorizontal: spacing.xl, marginBottom: spacing.sm }}>
                    <Typography variant="h4">Upcoming Holidays</Typography>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 12, paddingVertical: spacing.sm }}
                >
                    {upcomingHolidays.map((holiday) => (
                        <Card
                            key={holiday.id}
                            variant="raised"
                            onPress={() => handleHolidayPress(holiday)}
                            style={{ width: 220, height: 140, justifyContent: 'space-between', backgroundColor: colors.surface }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <View style={{ backgroundColor: colors.primary + '15', padding: 8, borderRadius: 12 }}>
                                    <Ionicons name="gift-outline" size={20} color={colors.primary} />
                                </View>
                                <Typography variant="caption" color={colors.primary} style={{ fontWeight: '600' }}>
                                    {new Date(2024, holiday.month - 1, holiday.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Typography>
                            </View>

                            <View style={{ gap: 4 }}>
                                <Typography variant="bodyBold" numberOfLines={1}>{holiday.title}</Typography>
                                <Typography variant="caption" color={colors.textSecondary} numberOfLines={2}>
                                    {holiday.description || `Celebrate ${holiday.title} with your loved ones.`}
                                </Typography>
                            </View>
                        </Card>
                    ))}
                </ScrollView>
            </Animated.View>

            <HolidaySubscribersSheet
                ref={subscribersSheetRef}
                holiday={selectedHoliday}
            />
        </View>
    );
}
