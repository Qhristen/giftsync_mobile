import HolidaySubscribersSheet from '@/components/sheets/HolidaySubscribersSheet';
import GridSkeleton from '@/components/skeletons/GridSkeleton';
import { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useGetEventTemplatesQuery } from '@/store/api/event';
import { EventTemplate } from '@/types';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, Calendar01Icon, GiftIcon } from '@hugeicons/core-free-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GlobalEventsScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();

    const { data: templates, isLoading: isTemplatesLoading } = useGetEventTemplatesQuery();

    const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | null>(null);
    const subscribersSheetRef = useRef<BottomSheetRef>(null);

    const handleOpenDetail = (template: EventTemplate) => {
        setSelectedTemplate(template);
        subscribersSheetRef.current?.expand();
    };

    if (isTemplatesLoading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                        <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={colors.ink} />
                    </Pressable>
                    <View style={styles.headerCopy}>
                        <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE DATE LIBRARY</Typography>
                        <Typography variant="h2">Borrow a celebration</Typography>
                    </View>
                </View>
                <GridSkeleton />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={colors.ink} />
                </Pressable>
                <View style={styles.headerCopy}>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>THE DATE LIBRARY</Typography>
                    <Typography variant="h2">Borrow a celebration</Typography>
                    <Typography variant="caption" color={colors.textSecondary}>Pick a shared moment, then choose who belongs on the list.</Typography>
                </View>
            </View>

            <FlashList
                data={templates}
                numColumns={2}
                contentContainerStyle={{ paddingHorizontal: spacing.xl - 7, paddingTop: 14, paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View

                        style={{ flex: 1, padding: 6 }}
                    >
                        <Pressable
                            onPress={() => handleOpenDetail(item)}
                            style={({ pressed }) => [
                                styles.templateCard,
                                {
                                    backgroundColor: [colors.lemon, colors.lilac, colors.mint, colors.peach][index % 4],
                                    borderColor: colors.ink,
                                    transform: [{ rotate: index % 2 ? '1deg' : '-1deg' }],
                                },
                                pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                            ]}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={GiftIcon} size={27} color={colors.ink} />
                            </View>
                            <Typography variant="bodyBold" style={{ textAlign: 'center' }} numberOfLines={2}>{item.title}</Typography>
                            <View style={[styles.datePill, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                <HugeiconsIcon icon={Calendar01Icon} size={13} color={colors.ink} />
                                <Typography variant="caption">
                                    {new Date(new Date().getFullYear(), item.month - 1, item.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Typography>
                            </View>
                        </Pressable>
                    </View>
                )}
            />

            <HolidaySubscribersSheet
                ref={subscribersSheetRef}
                holiday={selectedTemplate}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        gap: 13,
        paddingBottom: 8,
    },
    headerCopy: { flex: 1, gap: 2 },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 1 },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '-3deg' }],
    },
    templateCard: {
        minHeight: 176,
        padding: 15,
        borderRadius: 22,
        borderWidth: 1.5,
        alignItems: 'center',
        gap: 8,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 18,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    datePill: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.25, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4 },
    iconContainerLarge: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailContainer: {
        paddingBottom: 20,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
