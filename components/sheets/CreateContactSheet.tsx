import React, { forwardRef } from 'react';
import UnifiedCreationFlow from '../flows/UnifiedCreationFlow';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';

interface Props {
    onSuccess?: () => void;
}

const CreateContactSheet = forwardRef<BottomSheetRef, Props>(
    ({ onSuccess }, ref) => {
        return (
            <BottomSheetWrapper
                ref={ref}
                snapPoints={['75%', '90%']}
                scrollable
                keyboardBehavior="interactive"
                android_keyboardInputMode="adjustPan"
            >
                <UnifiedCreationFlow
                    onSuccess={onSuccess}
                    onCompleted={() => (ref as any)?.current?.close()}
                />
            </BottomSheetWrapper>
        );
    }
);

export default CreateContactSheet;
