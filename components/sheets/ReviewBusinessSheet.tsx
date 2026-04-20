import { useTheme } from '@/hooks/useTheme';
import { useAddReviewMutation } from '@/store/api/businessApi';
import { Order } from '@/types';
import React, { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { toast } from 'sonner-native';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';
import Button from '../ui/Button';
import Rating from '../ui/Rating';
import Typography from '../ui/Typography';

interface Props {
    order: Order | null;
    onSuccess: () => void;
}

const ReviewBusinessSheet = forwardRef<BottomSheetRef, Props>(
    ({ order, onSuccess }, ref) => {
        const { spacing, colors } = useTheme();
        const [rating, setRating] = useState(0);
        const [comment, setComment] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [addReview] = useAddReviewMutation();

        const handleSubmit = async () => {
            if (!order || rating === 0) return;

            setIsLoading(true);
            try {
                // Submit review to the actual API
                const businessId = order.item?.product?.businessId;
                if (!businessId) {
                    throw new Error('Business ID not found');
                }

                await addReview({ businessId, rating, comment }).unwrap();

                toast.success('Thank you for your review!');
                onSuccess();
                // Reset state
                setRating(0);
                setComment('');
            } catch (error) {
                toast.error('Failed to submit review. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (!order) return null;

        const businessName = order.item?.businessName || 'the Vendor';

        return (
            <BottomSheetWrapper ref={ref} snapPoints={['50%', "85%"]}
                scrollable
                keyboardBehavior="interactive"
                android_keyboardInputMode="adjustPan"
            >
                <View style={styles.content}>
                    <Typography variant="h2" align="center" style={{ marginBottom: spacing.sm }}>
                        Rate Your Experience
                    </Typography>
                    <Typography variant="body" align="center" color={colors.textSecondary} style={{ marginBottom: spacing.xl }}>
                        How was your experience with {businessName}? Your feedback helps them improve.
                    </Typography>

                    <View style={styles.ratingContainer}>
                        <Rating
                            rating={rating}
                            onRatingChange={setRating}
                            size={40}
                        />
                        <Typography variant="label" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
                            Tap to rate
                        </Typography>
                    </View>

                    <View style={[styles.inputContainer, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                        <TextInput
                            placeholder="Share more details about your experience (optional)"
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor={colors.textMuted}
                            style={[styles.input, { color: colors.textPrimary }]}
                        />
                    </View>

                    <Button
                        title="Submit Review"
                        onPress={handleSubmit}
                        isLoading={isLoading}
                        disabled={rating === 0}
                        style={{ marginTop: spacing.xl }}
                    />
                </View>
            </BottomSheetWrapper>
        );
    }
);

const styles = StyleSheet.create({
    content: {
        paddingVertical: 12,
        paddingBottom: 40,
    },
    ratingContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    inputContainer: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        minHeight: 120,
    },
    input: {
        fontSize: 16,
    },
});

export default ReviewBusinessSheet;
