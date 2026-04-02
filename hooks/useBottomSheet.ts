import { BottomSheetRef } from '@/components/ui/BottomSheetWrapper';
import { useCallback, useRef } from 'react';

export function useBottomSheet() {
    const ref = useRef<BottomSheetRef>(null);

    const open = useCallback(() => {
        ref.current?.expand();
    }, []);

    const close = useCallback(() => {
        ref.current?.close();
    }, []);

    const snapTo = useCallback((index: number) => {
        ref.current?.snapToIndex(index);
    }, []);

    return { ref, open, close, snapTo };
}
