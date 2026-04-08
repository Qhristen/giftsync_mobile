import { addDays, differenceInDays, format, formatDistanceToNow, isAfter, isBefore, startOfDay } from 'date-fns';

export function formatDate(date: string | Date, pattern: string = 'MMMM dd, yyyy') {
    return format(new Date(date), pattern);
}

export function formatDistance(date: string | Date) {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getCountdown(date: string | Date) {
    const target = startOfDay(new Date(date));
    const now = startOfDay(new Date());

    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays < 0) return 'past';
    return `in ${diffDays}d`;
}

export function isUpcoming(date: string | Date, withinDays: number = 30) {
    const target = new Date(date);
    const now = new Date();
    const limit = addDays(now, withinDays);

    return isAfter(target, now) && isBefore(target, limit);
}

export function calculateDeliveryStatus(
    occasionDateStr: string | Date,
    deliveryDays: number = 1,
    recipientName: string = 'Recipient'
) {
    const today = startOfDay(new Date());
    const occasionDate = startOfDay(new Date(occasionDateStr));
    const deliveryDate = addDays(today, deliveryDays);

    const daysToOccasion = differenceInDays(occasionDate, today);
    const canArriveOnTime = daysToOccasion >= deliveryDays;
    const arrivalDate = format(deliveryDate, 'MMM do');

    return {
        canArriveOnTime,
        daysToOccasion,
        arrivalDate,
        deliveryDays,
        recipientName
    };
}
