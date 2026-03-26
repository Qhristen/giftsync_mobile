import { useTheme } from '@/hooks/useTheme';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetScrollView,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useMemo } from 'react';

export type BottomSheetRef = BottomSheet;

interface Props {
    snapPoints: (string | number)[];
    children: React.ReactNode;
    scrollable?: boolean;
    onClose?: () => void;
    index?: number;
}

const BottomSheetWrapper = forwardRef<BottomSheetRef, Props>(
    ({ snapPoints, children, scrollable = false, onClose, index = -1 }, ref) => {
        const { colors, spacing } = useTheme();
        const Container = scrollable ? BottomSheetScrollView : BottomSheetView;

        const renderBackdrop = useMemo(
            () => (props: BottomSheetBackdropProps) => (
                <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    opacity={0.6}
                />
            ),
            []
        );

        return (
            <BottomSheet
                ref={ref}
                index={index}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: colors.surface }}
                handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
                onChange={(idx) => {
                    if (idx === -1) onClose?.();
                }}
            >
                <Container style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>{children}</Container>
            </BottomSheet>
        );
    }
);

export default BottomSheetWrapper;
