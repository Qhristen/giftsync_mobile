import CreateOccasionSheet, { OccasionFormData } from '@/components/sheets/CreateOccasionSheet';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, View, useWindowDimensions } from 'react-native';

import { RootState } from '@/store';
import { addOccasion } from '@/store/slices/occasionSlice';
import { spendCoins } from '@/store/slices/walletSlice';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner-native';

export default function OccasionsScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const occasions = useSelector((state: RootState) => state.occasions.items);
    const { coins } = useSelector((state: RootState) => state.wallet);
    const dispatch = useDispatch();
    const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
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
            centerMonth(selectedMonth);
        }, 100);
        return () => clearTimeout(timer);
    }, [selectedMonth, scrollWidth]);

    const handleOpenCreateSheet = () => {
        if (coins < 1) {
            toast.error('No Coins', {
                description: 'You need at least 1 coin to create an occasion. Please top up in your profile.'
            });
            return;
        }
        createSheetRef.current?.expand();
    };

    const handleCreateSubmit = (data: OccasionFormData) => {
        dispatch(spendCoins(1));
        dispatch(addOccasion({
            id: Date.now().toString(),
            name: data.name,
            type: data.type,
            date: data.date,
            countdown: 'in 365d',
            dotColor: 'green',
        }));
        createSheetRef.current?.close();
        toast.success('Success', {
            description: 'Occasion created successfully!'
        });
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const sections = [
        { title: 'Upcoming this month', data: occasions.filter(o => o.date.includes(selectedMonth)) },
        { title: 'Other Occasions', data: occasions.filter(o => !o.date.includes(selectedMonth)) },
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
                    {months.map((m) => (
                        <Pressable
                            key={m}
                            onLayout={(e) => {
                                const { x, width } = e.nativeEvent.layout;
                                monthLayouts.current[m] = { x, width };
                                // Handle initial mount centering
                                if (m === selectedMonth) centerMonth(m);
                            }}
                            onPress={() => setSelectedMonth(m)}
                            style={({ pressed }) => [
                                styles.monthBtn,
                                { backgroundColor: selectedMonth === m ? colors.primary : colors.surfaceRaised },
                                pressed && { opacity: 0.8 },
                            ]}
                        >
                            <Typography variant="label" color={selectedMonth === m ? '#FFFFFF' : colors.textPrimary}>{m}</Typography>
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
                        <Avatar uri={item.avatarUrl} name={item.name} size="sm" />
                        <View style={styles.itemContent}>
                            <Typography variant="bodyBold">{item.name}</Typography>
                            <Typography variant="caption" color={colors.textSecondary}>
                                {item.type} • {item.date}
                            </Typography>
                        </View>
                        <Badge label={item.countdown} size="xs" variant="amber" />
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

            <CreateOccasionSheet ref={createSheetRef} onSubmit={handleCreateSubmit} />
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
