import React, { forwardRef } from 'react';
import OccasionForm from '../occasions/OccasionForm';
import BottomSheetWrapper, { BottomSheetRef } from '../ui/BottomSheetWrapper';

interface Props {
    onSuccess?: () => void;
    isLoading?: boolean;
    isEditing?: boolean;
    occasionId?: string;
    fixedContactId?: string;
    fixedContactName?: string;
    fixedContactPhone?: string;
}

const CreateOccasionSheet = forwardRef<BottomSheetRef, Props>(
    ({ onSuccess, isLoading, isEditing, occasionId, fixedContactId, fixedContactName, fixedContactPhone }, ref) => {
        return (
            <BottomSheetWrapper
                ref={ref}
                snapPoints={['65%', '90%']}
                scrollable
                keyboardBehavior="interactive"
                android_keyboardInputMode="adjustPan"
            >
                <OccasionForm
                    onSuccess={onSuccess}
                    onCompleted={() => (ref as any)?.current?.close()}
                    isLoading={isLoading}
                    isEditing={isEditing}
                    occasionId={occasionId}
                    fixedContactId={fixedContactId}
                    fixedContactName={fixedContactName}
                    fixedContactPhone={fixedContactPhone}
                />
            </BottomSheetWrapper>
        );
    }
);

export default CreateOccasionSheet;
