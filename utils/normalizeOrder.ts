import { Order } from '@/types';

const numericValue = (value: unknown): number => {
    const normalized = Number(value ?? 0);
    return Number.isFinite(normalized) ? normalized : 0;
};

export const normalizeOrder = <T extends Partial<Order>>(order: T): T => ({
    ...order,
    total: numericValue(order.total),
    amountPaid: numericValue(order.amountPaid),
    additionalPaymentTotal: numericValue(order.additionalPaymentTotal),
    additionalPayments: order.additionalPayments?.map((payment) => ({
        ...payment,
        amount: numericValue(payment.amount),
    })),
});

export const getOutstandingAmount = (order?: Pick<Order, 'total' | 'amountPaid'> | null): number =>
    Math.max(0, numericValue(order?.total) - numericValue(order?.amountPaid));
