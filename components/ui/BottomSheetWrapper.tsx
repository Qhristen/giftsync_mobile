import { useTheme } from '@/hooks/useTheme';
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetScrollView,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';

export interface BottomSheetRef {
    expand: () => void;
    close: () => void;
    snapToIndex: (index: number) => void;
    present: () => void;
    dismiss: () => void;
}

interface Props {
    snapPoints: (string | number)[];
    children: React.ReactNode;
    scrollable?: boolean;
    onClose?: () => void;
    index?: number;
    keyboardBehavior?: 'extend' | 'fillParent' | 'interactive';
    keyboardBlurBehavior?: 'none' | 'restore';
    android_keyboardInputMode?: 'adjustResize' | 'adjustPan';
}

const BottomSheetWrapper = forwardRef<BottomSheetRef, Props>(
    ({ snapPoints, children, scrollable = false, onClose, index = -1, keyboardBehavior = 'fillParent', keyboardBlurBehavior = 'restore', android_keyboardInputMode = 'adjustResize' }, ref) => {
        const { colors, spacing } = useTheme();
        const Container = scrollable ? BottomSheetScrollView : BottomSheetView;
        const modalRef = useRef<BottomSheetModal>(null);

        useImperativeHandle(ref, () => ({
            expand: () => modalRef.current?.present(),
            close: () => modalRef.current?.dismiss(),
            snapToIndex: (i: number) => modalRef.current?.snapToIndex(i),
            present: () => modalRef.current?.present(),
            dismiss: () => modalRef.current?.dismiss(),
        }), []);

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
            <BottomSheetModal
                ref={modalRef}
                index={Math.max(0, index)}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: colors.surface }}
                handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
                keyboardBehavior={keyboardBehavior}
                keyboardBlurBehavior={keyboardBlurBehavior}
                android_keyboardInputMode={android_keyboardInputMode}
                onDismiss={onClose}
            >
                <Container
                    style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </Container>
            </BottomSheetModal>
        );
    }
);

export default BottomSheetWrapper;
