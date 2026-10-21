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
            <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingTop: insets.top + moderateScale(10), paddingBottom: spacing.lg }]}>
                <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={moderateScale(22)} color={colors.ink} />
                </Pressable>
                <View style={styles.headerCopy}>
                    <Typography variant="caption" color={colors.textSecondary} style={styles.overline}>DELIVERY ADDRESS BOOK</Typography>
                    <Typography variant="h2">Doorsteps that matter</Typography>
                </View>
            </View>

            {isLoading ? (
                <View style={{ flex: 1, paddingTop: moderateScale(20) }}>
                    <AddressListSkeleton />
                </View>
            ) : (
                <FlashList
                    data={addresses}
                    // estimatedItemSize={85}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: moderateScale(120) }}
                    ListEmptyComponent={() => (
                        <View style={[styles.empty, { backgroundColor: colors.lemon, borderColor: colors.ink }]}>
                            <HugeiconsIcon icon={Location01Icon} size={moderateScale(34)} color={colors.ink} />
                            <Typography variant="h3">No pins on the map.</Typography>
                            <Typography variant="body" color={colors.textSecondary} align="center">Add a doorstep so the next gift knows where to go.</Typography>
                        </View>
                    )}
                    renderItem={({ item, index }) => (
                        <View>
                            <Card style={[styles.addressCard, { backgroundColor: paper[index % paper.length], borderColor: colors.ink, transform: [{ rotate: index % 2 ? '0.6deg' : '-0.6deg' }] }]}>
                                <View style={[styles.iconBox, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
                                    <HugeiconsIcon icon={Location01Icon} size={moderateScale(23)} color={colors.ink} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(8) }}>
                                        <Typography variant="bodyBold">{item.recipientName}</Typography>
                                        {item.isDefault && (
                                            <View style={[styles.defaultBadge, { backgroundColor: colors.lime, borderColor: colors.ink }]}>
                                                <Typography variant="caption" style={{ fontSize: moderateScale(10), fontWeight: '800' }}>HOME BASE</Typography>
                                            </View>
                                        )}
                                    </View>
                                    <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: moderateScale(4) }}>
                                        {item.line1}, {item.city}, {item.state}
                                    </Typography>
                                </View>
                                <Pressable style={[styles.editButton, { backgroundColor: colors.surface, borderColor: colors.ink }]} onPress={handleEdit}>
                                    <HugeiconsIcon icon={Edit01Icon} size={moderateScale(19)} color={colors.ink} />
                                </Pressable>
                            </Card>
                        </View>
                    )}
                />
            )}

            <View style={[styles.footer, { backgroundColor: colors.background, paddingBottom: insets.bottom + moderateScale(16) }]}>
                <Button
                    title="Pin a new doorstep"
                    variant="primary"
                    onPress={() => addressSheet.open()}
                    leftIcon={<HugeiconsIcon icon={PlusSignIcon} size={moderateScale(20)} color="#17151D" />}
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
        gap: moderateScale(13),
    },
    headerCopy: { flex: 1 },
    overline: { fontFamily: 'DMSans_700Bold', letterSpacing: moderateScale(1) },
    backBtn: {
        width: moderateScale(44),
        height: moderateScale(44),
        borderWidth: 1.5,
        borderRadius: moderateScale(14),
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '-3deg' }],
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(16),
        marginBottom: moderateScale(16),
        gap: moderateScale(13),
        borderWidth: 1.5,
        borderRadius: moderateScale(21),
    },
    iconBox: {
        width: moderateScale(48),
        height: moderateScale(48),
        borderRadius: moderateScale(15),
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultBadge: {
        paddingHorizontal: moderateScale(6),
        paddingVertical: moderateScale(2),
        borderRadius: moderateScale(8),
        borderWidth: 1.25,
    },
    editButton: { width: moderateScale(38), height: moderateScale(38), borderRadius: moderateScale(12), borderWidth: 1.25, alignItems: 'center', justifyContent: 'center' },
    empty: { marginTop: moderateScale(34), padding: moderateScale(24), borderWidth: 1.5, borderRadius: moderateScale(24), alignItems: 'center', gap: moderateScale(8) },
    footer: {
        position: 'absolute',
        bottom: moderateScale(0),
        width: '100%',
        paddingHorizontal: moderateScale(20),
        paddingTop: moderateScale(14),
    },
});
