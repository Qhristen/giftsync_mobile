import { PaymentGateway } from '@/types';

export const PAYMENT_GATEWAY_LABELS: Record<PaymentGateway, string> = {
    bachs: 'Bachs',
    paystack: 'Paystack',
    flutterwave: 'Flutterwave',
};

export const isPaymentFailureUrl = (url: string) => {
    try {
        const parsedUrl = new URL(url);
        const status = parsedUrl.searchParams.get('status')?.toLowerCase();
        const hasFailurePath = /(?:^|\/)(?:cancel|cancelled|fail|failed|declined)(?:\/|$)/i.test(parsedUrl.pathname);

        return hasFailurePath || ['cancel', 'cancelled', 'fail', 'failed', 'declined'].includes(status || '');
    } catch {
        return /(?:cancel|fail|declined)/i.test(url);
    }
};

export const isPaymentCallbackUrl = (url: string) => {
    try {
        const parsedUrl = new URL(url);
        const status = parsedUrl.searchParams.get('status')?.toLowerCase();
        const paymentAction = parsedUrl.searchParams.get('payment')?.toLowerCase();
        const hasCompletionPath = /(?:^|\/)(?:success|successful|callback)(?:\/|$)/i.test(parsedUrl.pathname);

        return hasCompletionPath
            || paymentAction === 'callback'
            || ['success', 'successful', 'completed'].includes(status || '')
            || parsedUrl.searchParams.has('trxref')
            || parsedUrl.searchParams.has('checkout_id');
    } catch {
        return /(?:success|callback|trxref|checkout_id)/i.test(url);
    }
};
