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
import { StyleSheet, View } from 'react-native';
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
            () => function SheetBackdrop(props: BottomSheetBackdropProps) {
                return (
                    <BottomSheetBackdrop
                        {...props}
                        appearsOnIndex={0}
                        disappearsOnIndex={-1}
                        opacity={0.6}
                    />
                );
            },
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
                backgroundStyle={{
                    backgroundColor: colors.surface,
                    borderColor: colors.ink,
                    borderWidth: 1.5,
                    borderBottomWidth: 0,
                    borderTopLeftRadius: 30,
                    borderTopRightRadius: 30,
                    shadowColor: colors.ink,
                    shadowOffset: { width: 0, height: -5 },
                    shadowOpacity: 0.2,
                    shadowRadius: 0,
                }}
                handleStyle={[styles.handle, { backgroundColor: colors.lavender, borderColor: colors.ink }]}
                handleIndicatorStyle={{ backgroundColor: colors.ink, width: 48, height: 4 }}
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
                    <View pointerEvents="none" style={styles.paperEdge}>
                        <View style={[styles.edgeDash, { borderColor: colors.textMuted }]} />
                        <View style={[styles.sheetStamp, { backgroundColor: colors.lime, borderColor: colors.ink }]} />
                    </View>
                    {children}
                </Container>
            </BottomSheetModal>
        );
    }
);

BottomSheetWrapper.displayName = 'BottomSheetWrapper';

const styles = StyleSheet.create({
    handle: {
        height: 28,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderBottomWidth: 1,
        paddingTop: 11,
    },
    paperEdge: {
        height: 15,
        justifyContent: 'center',
        marginBottom: 5,
    },
    edgeDash: {
        borderTopWidth: 1,
        borderStyle: 'dashed',
        opacity: 0.7,
    },
    sheetStamp: {
        position: 'absolute',
        right: 10,
        width: 24,
        height: 10,
        borderWidth: 1,
        transform: [{ rotate: '5deg' }],
    },
});

export default BottomSheetWrapper;
