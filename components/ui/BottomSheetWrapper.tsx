import { useTheme } from '@/hooks/useTheme';
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetFooter,
    BottomSheetFooterProps,
    BottomSheetModal,
    BottomSheetScrollView,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    renderFooter?: (props: BottomSheetFooterProps) => React.ReactElement;
    disablePadding?: boolean;
    enableFlex?: boolean;
}

const BottomSheetWrapper = forwardRef<BottomSheetRef, Props>(
    ({ snapPoints, children, scrollable = false, onClose, index = 0, keyboardBehavior = 'fillParent', keyboardBlurBehavior = 'restore', android_keyboardInputMode = 'adjustResize', renderFooter, disablePadding = false, enableFlex = false }, ref) => {
        const { colors, spacing } = useTheme();
        const Container = scrollable ? BottomSheetScrollView : (enableFlex ? View : BottomSheetView);
        const modalRef = useRef<BottomSheetModal>(null);
        const insets = useSafeAreaInsets();
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

        const renderFooterComponent = useCallback(
            (props: BottomSheetFooterProps) => {
                if (renderFooter) {
                    return (
                        <BottomSheetFooter {...props}>
                            {renderFooter(props)}
                        </BottomSheetFooter>
                    );
                }
                return null;
            },
            [renderFooter]
        );

        return (
            <BottomSheetModal
                ref={modalRef}
                index={index}
                snapPoints={snapPoints}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                backgroundStyle={{ backgroundColor: colors.surface }}
                handleIndicatorStyle={{ backgroundColor: colors.border, width: 40 }}
                keyboardBehavior={keyboardBehavior}
                keyboardBlurBehavior={keyboardBlurBehavior}
                android_keyboardInputMode={android_keyboardInputMode}
                onDismiss={onClose}
                footerComponent={renderFooter ? renderFooterComponent : undefined}
                

            >
                <Container
                    style={[
                        enableFlex && { flex: 1 },
                        !disablePadding && { paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing['3xl'] }
                    ]}
                    {...(scrollable ? { showsVerticalScrollIndicator: false } : {})}
                >
                    {children}
                </Container>
            </BottomSheetModal>
        );
    }
);

export default BottomSheetWrapper;
