import Avatar from '@/components/ui/Avatar';
import FeatureUnavailable from '@/components/features/FeatureUnavailable';
import Card from '@/components/ui/Card';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { useGetBlockedUsersQuery, useUnblockUserMutation } from '@/store/api/trustSafetyApi';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon, Shield01Icon } from '@hugeicons/core-free-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';

export default function BlockedUsersScreen() {
    const router = useRouter();
    const { colors, spacing } = useTheme();
    const { enabled: trustSafetyEnabled } = useFeatureFlag('trust_safety');
    const { data: blockedUsers = [], isLoading, refetch } = useGetBlockedUsersQuery(undefined, { skip: !trustSafetyEnabled });
    const [unblockUser, { isLoading: isUnblocking }] = useUnblockUserMutation();

    const handleUnblock = (id: string, name: string) => {
        Alert.alert(
            'Unblock User',
            `Are you sure you want to unblock ${name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Unblock',
                    onPress: async () => {
                        try {
                            await unblockUser(id).unwrap();
                            toast.success('User unblocked');
                            refetch();
                        } catch (error: any) {
                            toast.error('Error', { description: error?.data?.message || 'Failed to unblock user' });
                        }
                    }
                }
            ]
        );
    };

    if (!trustSafetyEnabled) return <FeatureUnavailable title="Safety tools are unavailable" />;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.textPrimary} />
                </Pressable>
                <Typography variant="h3">Blocked Users</Typography>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={blockedUsers}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: spacing.xl }}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <HugeiconsIcon icon={Shield01Icon} size={64} color={colors.textMuted} />
                            <Typography variant="body" color={colors.textSecondary} style={{ marginTop: spacing.md, textAlign: 'center' }}>
                                You haven&apos;t blocked anyone yet.
                            </Typography>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <Card style={styles.userCard}>
                            <View style={styles.userInfo}>
                                <Avatar uri={item.blocked.avatarUrl} name={item.blocked.name} size={44} />
                                <View style={{ marginLeft: spacing.md }}>
                                    <Typography variant="bodyBold">{item.blocked.name}</Typography>
                                    <Typography variant="caption" color={colors.textSecondary}>{item.blocked.email}</Typography>
                                </View>
                            </View>
                            <Pressable
                                onPress={() => handleUnblock(item.id, item.blocked.name)}
                                style={[styles.unblockBtn, { backgroundColor: colors.surfaceRaised }]}
                            >
                                <Typography variant="caption" color={colors.primary}>UNBLOCK</Typography>
                            </Pressable>
                        </Card>
                    )}
                />
            )}
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
        marginBottom: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    unblockBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    }
});
