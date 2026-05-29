import { addDays, differenceInDays, format, formatDistanceToNow, isAfter, isBefore, startOfDay } from 'date-fns';

export function formatDate(date: string | Date | undefined | null, pattern: string = 'MMMM dd, yyyy') {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid date';
    return format(d, pattern);
}

export function formatDistance(date: string | Date | undefined | null) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return formatDistanceToNow(d, { addSuffix: true });
}

export function getCountdown(date: string | Date) {
    const target = startOfDay(new Date(date));
    const now = startOfDay(new Date());

    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    if (diffDays < 0) return 'past';
    return `in ${diffDays} days`;
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



export const formatDateString = (dateStr: string) => {
        const d = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

        return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    };

    export const formatTime = (dateStr: string) => {
            const d = new Date(dateStr);
            return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        };
    