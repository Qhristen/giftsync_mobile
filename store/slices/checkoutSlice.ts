import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProductSnapshot {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
}

interface Address {
    id?: string;
    recipientName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    phone: string;
}

interface CheckoutState {
    // Gift details
    productId: string | null;
    productSnapshot: ProductSnapshot | null;
    variantId?: string | null;

    // Context (recipient and occasion)
    recipientContactId: string | null;
    occasionId: string | null;

    // Delivery
    deliveryAddress: Address | null;
    deliveryDate: string | null;
    deliveryTimeWindow: 'morning' | 'afternoon' | 'evening' | null;
    includesPremiumPackaging: boolean;
    giftMessage: string;

    // Payment
    selectedPaymentMethodId: string | null;
    promoCode: string | null;
    promoDiscount: number;

    // UI context
    step: 'recipient' | 'delivery' | 'payment' | 'confirmation';
}

const initialState: CheckoutState = {
    productId: null,
    productSnapshot: null,
    recipientContactId: null,
    occasionId: null,
    deliveryAddress: null,
    deliveryDate: null,
    deliveryTimeWindow: null,
    includesPremiumPackaging: false,
    giftMessage: '',
    selectedPaymentMethodId: null,
    promoCode: null,
    promoDiscount: 0,
    step: 'recipient',
};

const checkoutSlice = createSlice({
    name: 'checkout',
    initialState,
    reducers: {
        startOrder: (state, action: PayloadAction<{ contactId?: string; occasionId?: string; productId?: string }>) => {
            // Re-initialize state when starting a new order
            Object.assign(state, initialState);
            if (action.payload.contactId) state.recipientContactId = action.payload.contactId;
            if (action.payload.occasionId) state.occasionId = action.payload.occasionId;
            if (action.payload.productId) state.productId = action.payload.productId;
        },
        setProduct: (state, action: PayloadAction<{ productId: string; snapshot: ProductSnapshot }>) => {
            state.productId = action.payload.productId;
            state.productSnapshot = action.payload.snapshot;
        },
        setRecipient: (state, action: PayloadAction<{ contactId: string; occasionId: string }>) => {
            state.recipientContactId = action.payload.contactId;
            state.occasionId = action.payload.occasionId;
        },
        setDeliveryDetails: (state, action: PayloadAction<Partial<Pick<CheckoutState, 'deliveryAddress' | 'deliveryDate' | 'deliveryTimeWindow' | 'includesPremiumPackaging' | 'giftMessage'>>>) => {
            Object.assign(state, action.payload);
        },
        setPaymentDetails: (state, action: PayloadAction<Partial<Pick<CheckoutState, 'selectedPaymentMethodId' | 'promoCode' | 'promoDiscount'>>>) => {
            Object.assign(state, action.payload);
        },
        setCheckoutStep: (state, action: PayloadAction<CheckoutState['step']>) => {
            state.step = action.payload;
        },
        resetCheckout: (state) => {
            Object.assign(state, initialState);
        },
    },
});

export const { startOrder, setProduct, setRecipient, setDeliveryDetails, setPaymentDetails, setCheckoutStep, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
