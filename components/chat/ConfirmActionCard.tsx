import Button from '@/components/ui/Button';
import Typography from '@/components/ui/Typography';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/formatCurrency';
import { moderateScale } from '@/utils/scaling';
import { AiActionDetails, AiUiData } from '@/store/api/aiApi';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
    Mail01Icon,
    ShoppingCart01Icon,
    Tag01Icon,
    UserIcon,
} from '@hugeicons/core-free-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';interface ConfirmActionCardProps {
    actionType: NonNullable<AiUiData['actionType']>;
    details: AiActionDetails;
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
                            <HugeiconsIcon icon={UserIcon} size={moderateScale(16)} color={colors.textSecondary} />
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
                            <HugeiconsIcon icon={ShoppingCart01Icon} size={moderateScale(16)} color={colors.textSecondary} />
                            <Typography variant="bodyBold" color={colors.textPrimary} style={styles.detailText}>
                                {details.productName}
                            </Typography>
                        </View>
                        <View style={styles.detailRow}>
                            <HugeiconsIcon icon={Tag01Icon} size={moderateScale(16)} color={colors.textSecondary} />
                            <Typography variant="bodyBold" color={colors.primary} style={styles.detailText}>
                                {formatCurrency(Number(details.price || 0), currency)}
                            </Typography>
                        </View>
                    </View>
                );
            case 'create_gift_request':
                return (
                    <View style={styles.detailsContainer}>
                        <Detail label="Recipient" value={details.recipientName} />
                        <Detail label="Occasion" value={details.occasion} />
                        <Detail label="Gift brief" value={details.description} />
                        <Detail label="Category" value={details.category} />
                        <Detail
                            label="Budget"
                            value={details.budget != null ? formatCurrency(details.budget, details.currency || currency) : undefined}
                        />
                        <Detail
                            label="Needed by"
                            value={details.neededBy ? new Date(details.neededBy).toLocaleDateString() : undefined}
                        />
                        <Detail label="Delivery window" value={details.orderDetails?.deliveryTimeWindow} />
                        {!!details.preferences?.length && <Detail label="Preferences" value={details.preferences.join(' · ')} />}
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
            case 'create_gift_request':
                return 'Confirm Gift Request';
            default:
                return 'Confirm Action';
        }
    };

    return (
        <View

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
                <Typography variant="bodyBold" style={{ fontSize: moderateScale(14) }}>{getTitle()}</Typography>
                <HugeiconsIcon
                    icon={actionType === 'purchase_product' || actionType === 'create_gift_request' ? ShoppingCart01Icon : Mail01Icon}
                    size={moderateScale(18)}
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
                {(actionType === 'send_direct_sms' || actionType === 'send_occasion_message' || actionType === 'create_gift_request') && (
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
        </View>
    );
};

function Detail({ label, value }: { label: string; value?: string }) {
    const { colors } = useTheme();
    if (!value) return null;

    return (
        <View style={styles.summaryRow}>
            <Typography variant="caption" color={colors.textSecondary}>{label.toUpperCase()}</Typography>
            <Typography variant="bodyMedium" color={colors.textPrimary}>{value}</Typography>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: moderateScale(20),
        padding: moderateScale(16),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: moderateScale(12),
    },
    detailsContainer: {
        gap: moderateScale(8),
        marginBottom: moderateScale(16),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(8),
    },
    detailText: {
        fontSize: moderateScale(14),
    },
    summaryRow: {
        gap: moderateScale(2),
    },
    messagePreview: {
        padding: moderateScale(12),
        borderRadius: moderateScale(12),
        borderWidth: 1,
        marginTop: moderateScale(4),
    },
    actions: {
        flexDirection: 'row',
        gap: moderateScale(8),
    },
    actionButton: {
        flex: 1,
        height: moderateScale(36),
        borderRadius: moderateScale(18),
    },
});

export default ConfirmActionCard;
