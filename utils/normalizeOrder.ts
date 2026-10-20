import { Order } from '@/types';

const numericValue = (value: unknown): number => {
    const normalized = Number(value ?? 0);
    return Number.isFinite(normalized) ? normalized : 0;
};

export const normalizeOrder = <T extends Partial<Order>>(order: T): T => ({
    ...order,
    subtotal: numericValue(order.subtotal),
    deliveryFee: numericValue(order.deliveryFee),
    packagingFee: numericValue(order.packagingFee),
    discountAmount: numericValue(order.discountAmount),
    total: numericValue(order.total),
    item: order.item ? {
        ...order.item,
        unitPrice: numericValue(order.item.unitPrice),
        lineTotal: order.item.lineTotal == null ? undefined : numericValue(order.item.lineTotal),
        total: order.item.total == null ? undefined : numericValue(order.item.total),
    } : order.item,
});
