import CreateOccasionSheet, { OccasionFormData } from '@/components/sheets/CreateOccasionSheet';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, View } from 'react-native';

import { RootState } from '@/store';
import { useCreateOccasionMutation, useGetMonthlyOccasionsQuery, useGetUpcomingOccasionsQuery } from '@/store/api/occasionApi';
import { spendCoins } from '@/store/slices/walletSlice';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner-native';

export default function OccasionsScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();

    // API Hooks
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());
    const currentYear = new Date().getFullYear();

    const { data: upcomingOccasions = [], isLoading: isUpcomingLoading, refetch: refetchUpcoming } = useGetUpcomingOccasionsQuery();
    const { data: monthlyOccasions = [], isLoading, refetch } = useGetMonthlyOccasionsQuery({
        month: selectedMonthIndex + 1,
        year: currentYear
    });

    const [createOccasion, { isLoading: isCreating, error }] = useCreateOccasionMutation();

    const { coins } = useSelector((state: RootState) => state.wallet);
    const dispatch = useDispatch();

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const selectedMonthName = months[selectedMonthIndex];

    const createSheetRef = useRef<BottomSheetRef>(null);
    const scrollRef = useRef<ScrollView>(null);
    const [scrollWidth, setScrollWidth] = useState(0);
    const monthLayouts = useRef<Record<string, { x: number; width: number }>>({});

    const centerMonth = (month: string) => {
        const layout = monthLayouts.current[month];
        if (layout && scrollRef.current && scrollWidth) {
            const centerX = layout.x - (scrollWidth / 2) + (layout.width / 2);
            scrollRef.current.scrollTo({ x: centerX, animated: true });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            centerMonth(selectedMonthName);
        }, 100);
        return () => clearTimeout(timer);
    }, [selectedMonthIndex, scrollWidth]);

    const handleOpenCreateSheet = () => {
        if (coins < 1) {
            toast.error('No Coins', {
                description: 'You need at least 1 coin to create an occasion. Please top up in your profile.'
            });
            return;
        }
        createSheetRef.current?.expand();
    };

    const handleCreateSubmit = async (data: OccasionFormData) => {
        try {
            await createOccasion({
                type: data.type,
                date: data.date,
                notes: data.notes,
                contactAvatar: data.contactAvatar,
                contactName: data.contactName,
                contactNumber: data.contactNumber,
                dotColor: 'blue', // Default color
            }).unwrap();

            dispatch(spendCoins(1));
            createSheetRef.current?.close();
            toast.success('Success', {
                description: 'Occasion created successfully!'
            });
        } catch (err) {
            toast.error('Error', {
                description: 'Failed to create occasion. Please try again.'
            });
        }
    };

  const sections = [
    { title: `Upcoming in ${selectedMonthName}`, data: monthlyOccasions },
    { title: 'Other Occasions', data: upcomingOccasions.filter(o => new Date(o.date).getMonth() !== selectedMonthIndex) },
];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Typography variant="h1" style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl }}>Calendar</Typography>

                {/* Simple Monthly Switcher */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onLayout={(e) => setScrollWidth(e.nativeEvent.layout.width)}
                    contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 12, paddingVertical: spacing.md }}
                >
                    {months.map((m, idx) => (
                        <Pressable
                            key={m}
                            onLayout={(e) => {
                                const { x, width } = e.nativeEvent.layout;
                                monthLayouts.current[m] = { x, width };
                                // Handle initial mount centering
                                if (idx === selectedMonthIndex) centerMonth(m);
                            }}
                            onPress={() => setSelectedMonthIndex(idx)}
                            style={({ pressed }) => [
                                styles.monthBtn,
                                { backgroundColor: selectedMonthIndex === idx ? colors.primary : colors.surfaceRaised },
                                pressed && { opacity: 0.8 },
                            ]}
                        >
                            <Typography variant="label" color={selectedMonthIndex === idx ? '#FFFFFF' : colors.textPrimary}>{m}</Typography>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => router.push({ pathname: '/(tabs)/occasions/[id]', params: { id: item.id } })}
                        style={({ pressed }) => [
                            styles.item,
                            { backgroundColor: pressed ? colors.surfaceRaised : 'transparent', paddingHorizontal: spacing.xl },
                        ]}
                    >
                        <View style={[styles.dot, { backgroundColor: item.dotColor === 'red' ? colors.primary : item.dotColor === 'blue' ? colors.secondary : colors.success }]} />
                        <Avatar uri={item.contactAvatar} name={item.contactName} size="sm" />
                        <View style={styles.itemContent}>
                            <Typography variant="bodyBold">{item.contactName}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>
                                {item.type} • {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </Typography>
                        </View>
                        <Badge label={item.source === 'google' ? 'Sync' : 'Custom'} size="xs" variant={item.source === 'google' ? 'primary' : 'amber'} />
                        <Button
                            title="Plan"
                            size="sm"
                            variant="outline"
                            onPress={() => router.push('/checkout')}
                            style={styles.planBtn}
                        />
                    </Pressable>
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={[styles.sectionHeader, { backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingVertical: spacing.xs }]}>
                        <Typography variant="label" color={colors.textSecondary} style={{ paddingVertical: 8 }}>
                            {title}
                        </Typography>
                    </View>
                )}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: spacing.md }}
            />

            {/* Create Occasion FAB */}
            <Pressable
                onPress={handleOpenCreateSheet}
                style={({ pressed }) => [
                    styles.fab,
                    { backgroundColor: colors.primary, bottom: spacing.xl + 80, right: spacing.xl },
                    pressed && { opacity: 0.9, transform: [{ scale: 0.95 }] }
                ]}
            >
                <Ionicons name="add" size={32} color="#FFFFFF" />
            </Pressable>

            <CreateOccasionSheet
                ref={createSheetRef}
                onSubmit={handleCreateSubmit}
                isLoading={isCreating}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
    },
    header: {
        paddingBottom: 0,
    },
    monthBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    itemContent: {
        flex: 1,
    },
    sectionHeader: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    planBtn: {
        paddingHorizontal: 12,
        borderRadius: 100,
    },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
