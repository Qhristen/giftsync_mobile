import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnboardingState {
    currentStep: 1 | 2 | 3 | 4;
    profile: {
        photoUrl?: string;
        displayName?: string;
        preferredCurrency: 'NGN' | 'USD';
        persona?: 'Busy Professional' | 'Social Connector' | 'Thoughtful Giver';
    };
    hasCompletedOnboarding: boolean;
}

const initialState: OnboardingState = {
    currentStep: 1,
    profile: {
        preferredCurrency: 'NGN',
    },
    hasCompletedOnboarding: false,
};

const onboardingSlice = createSlice({
    name: 'onboarding',
    initialState,
    reducers: {
        nextStep: (state) => {
            if (state.currentStep < 4) {
                state.currentStep = (state.currentStep + 1) as OnboardingState['currentStep'];
            }
        },
        prevStep: (state) => {
            if (state.currentStep > 1) {
                state.currentStep = (state.currentStep - 1) as OnboardingState['currentStep'];
            }
        },
        updateProfile: (state, action: PayloadAction<Partial<OnboardingState['profile']>>) => {
            state.profile = { ...state.profile, ...action.payload };
        },
        completeOnboarding: (state) => {
            state.hasCompletedOnboarding = true;
        },
        resetOnboarding: (state) => {
            Object.assign(state, initialState);
        },
    },
});

export const { nextStep, prevStep, updateProfile, completeOnboarding, resetOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;
