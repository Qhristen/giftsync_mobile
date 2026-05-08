import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/formatCurrency';
import { moderateFontScale } from '@/utils/scaling';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ConfirmActionCardProps {
    actionType: 'send_direct_sms' | 'send_occasion_message' | 'purchase_product';
    details: {
        recipients?: string[];
        contactName?: string;
        message?: string;
        productId?: string;
        productName?: string;
        price?: string;
    };
    onConfirm: () => void;
    onEdit: () => void;
    onCancel: () => void;
    currency?: string;
}

const ConfirmActionCard: React.FC<ConfirmActionCardProps> = ({
    actionType,
    details,
    onConfirm,
    onEdit,
    onCancel,
    currency = 'NGN',
}) => {
    const { colors, spacing } = useTheme();

    const renderDetails = () => {
        switch (actionType) {
            case 'send_direct_sms':
            case 'send_occasion_message':
                return (
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                            <Typography variant="bodyBold" color={colors.textPrimary} style={styles.detailText}>
                                {actionType === 'send_occasion_message' ? details.contactName : details.recipients?.join(', ')}
                            </Typography>
                        </View>
                        <View style={[styles.messagePreview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Typography variant="body" color={colors.textPrimary}>
                                {details.message}
                            </Typography>
                        </View>
                    </View>
                );
            case 'purchase_product':
                return (
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Ionicons name="cart-outline" size={16} color={colors.textSecondary} />
                            <Typography variant="bodyBold" color={colors.textPrimary} style={styles.detailText}>
                                {details.productName}
                            </Typography>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="pricetag-outline" size={16} color={colors.textSecondary} />
                            <Typography variant="bodyBold" color={colors.primary} style={styles.detailText}>
                                {formatCurrency(Number(details.price || 0), currency)}
                            </Typography>
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    const getTitle = () => {
        switch (actionType) {
            case 'send_direct_sms':
                return 'Confirm SMS';
            case 'send_occasion_message':
                return 'Confirm Greeting';
            case 'purchase_product':
                return 'Confirm Purchase';
            default:
                return 'Confirm Action';
        }
    };

    return (
        <Animated.View
            entering={FadeInDown.duration(400).springify()}
            style={[
                styles.container,
                {
                    backgroundColor: colors.surfaceRaised,
                    borderColor: colors.border,
                    marginLeft: spacing.xl,
                    marginRight: spacing.md,
                    marginBottom: spacing.md,
                }
            ]}
        >
            <View style={styles.header}>
                <Typography variant="bodyBold" style={{ fontSize: moderateFontScale(14) }}>{getTitle()}</Typography>
                <Ionicons
                    name={actionType === 'purchase_product' ? "cart" : "mail"}
                    size={18}
                    color={colors.primary}
                />
            </View>

            {renderDetails()}

            <View style={styles.actions}>
                <Button
                    title="Confirm"
                    onPress={onConfirm}
                    variant="primary"
                    size="sm"
                    style={styles.actionButton}
                />
                {(actionType === 'send_direct_sms' || actionType === 'send_occasion_message') && (
                    <Button
                        title="Edit"
                        onPress={onEdit}
                        variant="outline"
                        size="sm"
                        style={styles.actionButton}
                    />
                )}
                <Button
                    title="Cancel"
                    onPress={onCancel}
                    variant="ghost"
                    size="sm"
                    style={styles.actionButton}

                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 16,
      
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailsContainer: {
        gap: 8,
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailText: {
        fontSize: moderateFontScale(14),
    },
    messagePreview: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        height: 36,
        borderRadius: 18,
    },
});

export default ConfirmActionCard;
