import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import BottomSheetWrapper, { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetUpcomingOccasionsQuery } from '@/store/api/occasionApi';
import { OccasionTemplate } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface Props {
    holiday: OccasionTemplate | null;
}

const HolidaySubscribersSheet = forwardRef<BottomSheetRef, Props>(({ holiday }, ref) => {
    const { colors, spacing } = useTheme();
    const router = useRouter();
    const sheetRef = useRef<BottomSheetRef>(null);

    useImperativeHandle(ref, () => ({
        expand: () => sheetRef.current?.expand(),
        close: () => sheetRef.current?.close(),
        snapToIndex: (index: number) => sheetRef.current?.snapToIndex(index),
        present: () => sheetRef.current?.present(),
        dismiss: () => sheetRef.current?.dismiss(),
    }), []);
    const { data: upcomingOccasions = [] } = useGetUpcomingOccasionsQuery();

    const subscribers = useMemo(() => {
        if (!holiday) return [];
        return upcomingOccasions.filter(occ =>
            occ.templateId === holiday.id ||
            occ.title.toLowerCase().includes(holiday.title.toLowerCase())
        );
    }, [holiday, upcomingOccasions]);

    const handleBulkMessage = () => {
        // Implementation for bulk messaging
        // For now, it could open a chat or a new screen
        console.log('Bulk messaging:', subscribers.map(s => s.contact?.name));
    };

    const handleBulkGift = () => {
        // Redirect to shop with selected recipients context
        router.push('/(tabs)/shop');
    };

    return (
        <BottomSheetWrapper ref={sheetRef} snapPoints={['70%']} scrollable>
            {holiday ? (
                <View style={styles.container}>
                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="gift-outline" size={32} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Typography variant="h2">{holiday.title}</Typography>
                            <Typography variant="body" color={colors.textSecondary}>
                                Tracking {subscribers.length} {subscribers.length === 1 ? 'person' : 'people'}
                            </Typography>
                        </View>
                    </View>

                    <View style={styles.actionRow}>
                        <Button
                            title="Message All"
                            variant="secondary"
                            size="sm"
                            leftIcon={<Ionicons name="chatbubble-outline" size={18} color={colors.textPrimary} />}
                            style={{ flex: 1 }}
                            onPress={handleBulkMessage}
                            disabled={subscribers.length === 0}
                        />
                        <Button
                            title="Send Gifts"
                            variant="primary"
                            size="sm"
                            leftIcon={<Ionicons name="gift-outline" size={18} color="#FFF" />}
                            style={{ flex: 1 }}
                            onPress={handleBulkGift}
                            disabled={subscribers.length === 0}
                        />
                    </View>

                    <Typography variant="label" color={colors.textSecondary} style={{ marginBottom: spacing.md, marginTop: spacing.lg }}>
                        Tracked Contacts
                    </Typography>

                    {subscribers.length > 0 ? (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                            {subscribers.map((occ) => (
                                <View key={occ.id} style={[styles.subscriberItem, { backgroundColor: colors.surfaceRaised }]}>
                                    <Avatar uri={occ.contact?.avatar} name={occ.contact?.name} size="md" />
                                    <View style={{ flex: 1 }}>
                                        <Typography variant="bodyBold">{occ.contact?.name}</Typography>
                                        <Typography variant="caption" color={colors.textSecondary}>{occ.title}</Typography>
                                    </View>
                                    <Badge label="Ready" variant="success" size="xs" />
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                            <Typography variant="body" color={colors.textSecondary} align="center">
                                You aren't tracking any contacts for this holiday yet.
                            </Typography>
                            <Button
                                title="Add Someone"
                                variant="ghost"
                                onPress={() => {
                                    router.push('/global-occasions')
                                    sheetRef.current?.close();
                                }}
                            />
                        </View>
                    )}
                </View>
            ) : <View style={{ height: 100 }} />}
        </BottomSheetWrapper>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    subscriberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        gap: 12,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 12,
    }
});

export default HolidaySubscribersSheet;
