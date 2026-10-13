import AddressPickerSheet from '@/components/sheets/AddressPickerSheet';
import AddressListSkeleton from '@/components/skeletons/AddressListSkeleton';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useBottomSheet } from '@/hooks/useBottomSheet';
import { useTheme } from '@/hooks/useTheme';
import { useGetAddressesQuery } from '@/store/api/addressApi';
import { moderateScale } from '@/utils/scaling';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    ArrowLeft01Icon,
    Edit01Icon,
    Location01Icon,
    PlusSignIcon
} from '@hugeicons/core-free-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SavedAddressesScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const insets = useSafeAreaInsets();
    const { data: addresses = [], isLoading } = useGetAddressesQuery();
    const addressSheet = useBottomSheet();

    const handleEdit = () => {
        addressSheet.open();
    };

    const paper = [colors.lemon, colors.mint, colors.sky, colors.lavender];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingTop: insets.top + 10, paddingBottom: spacing.lg }]}>
                <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={22} color={colors.ink} />
                </Pressable>
                <View style={styles.headerCopy}>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>DELIVERY ADDRESS BOOK</Typography>
                    <Typography variant="h2">Doorsteps that matter</Typography>
                </View>
            </View>

            {isLoading ? (
                <View style={{ flex: 1, paddingTop: 20 }}>
                    <AddressListSkeleton />
                </View>
            ) : (
                <FlashList
                    data={addresses}
                    // estimatedItemSize={85}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 120 }}
                    ListEmptyComponent={() => (
                        <View style={[styles.empty, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={Location01Icon} size={34} color={colors.ink} />
                            <Typography variant="h3">No pins on the map.</Typography>
                            <Typography variant="body" color={colors.textSecondary} align="center">Add a doorstep so the next gift knows where to go.</Typography>
                        </View>
                    )}
                    renderItem={({ item, index }) => (
                        <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
                            <Card style={[styles.addressCard, { backgroundColor: paper[index % paper.length], borderColor: colors.ink, shadowColor: colors.ink, transform: [{ rotate: index % 2 ? '0.6deg' : '-0.6deg' }] }]}>
                                <View style={[styles.iconBox, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                    <HugeiconsIcon icon={Location01Icon} size={23} color={colors.ink} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Typography variant="bodyBold">{item.recipientName}</Typography>
                                        {item.isDefault && (
                                            <View style={[styles.defaultBadge, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                                                <Typography variant="caption" style={{ fontSize: moderateScale(10), fontWeight: '800' }}>HOME BASE</Typography>
                                            </View>
                                        )}
                                    </View>
                                    <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>
                                        {item.line1}, {item.city}, {item.state}
                                    </Typography>
                                </View>
                                <Pressable style={[styles.editButton, { backgroundColor: colors.surface, borderColor: colors.ink }]} onPress={handleEdit}>
                                    <HugeiconsIcon icon={Edit01Icon} size={19} color={colors.ink} />
                                </Pressable>
                            </Card>
                        </Animated.View>
                    )}
                />
            )}

            <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
                <Button
                    title="Pin a new doorstep"
                    variant="primary"
                    onPress={() => addressSheet.open()}
                    leftIcon={<HugeiconsIcon icon={PlusSignIcon} size={20} color="#17151D" />}
                />
            </View>

            <AddressPickerSheet
                ref={addressSheet.ref}
                onSelect={() => {
                    addressSheet.close();
                }}
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
        alignItems: 'center',
        gap: 13,
    },
    headerCopy: { flex: 1 },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: 1 },
    backBtn: {
        width: 44,
        height: 44,
        borderWidth: 1.5,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '-3deg' }],
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 16,
        gap: 13,
        borderWidth: 1.5,
        borderRadius: 21,
        shadowOffset: { width: 3, height: 4 },
        shadowOpacity: 0.13,
        shadowRadius: 0,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 15,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        borderWidth: 1.25,
    },
    editButton: { width: 38, height: 38, borderRadius: 12, borderWidth: 1.25, alignItems: 'center', justifyContent: 'center' },
    empty: { marginTop: 34, padding: 24, borderWidth: 1.5, borderRadius: 24, alignItems: 'center', gap: 8 },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 14,
    },
});
