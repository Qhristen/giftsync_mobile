import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const SAVED_ADDRESSES = [
    { id: '1', label: 'Home', address: '14 Chief Estate, Lekki Phase 1, Lagos', isDefault: true, icon: 'home-outline' },
    { id: '2', label: 'Office', address: 'Flutterwave HQ, 8 Providence St, Lekki', isDefault: false, icon: 'briefcase-outline' },
];

export default function SavedAddressesScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const [addresses] = useState(SAVED_ADDRESSES);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl, paddingBottom: spacing.md }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h3">Saved Addresses</Typography>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={addresses}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
                        <Card style={[styles.addressCard, { backgroundColor: colors.surface }]}>
                            <View style={[styles.iconBox, { backgroundColor: colors.surfaceRaised }]}>
                                <Ionicons name={item.icon as any} size={24} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Typography variant="bodyBold">{item.label}</Typography>
                                    {item.isDefault && (
                                        <View style={[styles.defaultBadge, { backgroundColor: colors.primarySoft }]}>
                                            <Typography variant="caption" color={colors.primary} style={{ fontSize: 10 }}>DEFAULT</Typography>
                                        </View>
                                    )}
                                </View>
                                <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>
                                    {item.address}
                                </Typography>
                            </View>
                            <Pressable style={{ padding: 8 }}>
                                <Ionicons name="create-outline" size={20} color={colors.textMuted} />
                            </Pressable>
                        </Card>
                    </Animated.View>
                )}
            />

            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                <Button
                    title="Add New Address"
                    variant="primary"
                    onPress={() => { }}
                    leftIcon={<Ionicons name="add" size={20} color="#FFF" style={{ marginRight: 8 }} />}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 16,
        gap: 16,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 24,
        borderTopWidth: 1,
    },
});
