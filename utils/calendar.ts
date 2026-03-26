import { Occasion } from '@/store/slices/occasionSlice';
import { format } from 'date-fns';
import * as Calendar from 'expo-calendar';

export async function fetchGoogleBirthdays(): Promise<Occasion[]> {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') return [];

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    // Specifically looking for Google calendars that might have birthdays
    // Usually, Google calendars have a specific name or source
    const googleCalendars = calendars.filter(cal => cal.source.type === 'com.google' || cal.name?.toLowerCase().includes('google'));

    if (googleCalendars.length === 0) return [];

    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);

    const eventOccasions: Occasion[] = [];
    const calendarIds = googleCalendars.map(cal => cal.id);

    try {
        const events = await Calendar.getEventsAsync(calendarIds, now, oneYearFromNow);

        events.forEach(event => {
            const title = event.title.toLowerCase();
            if (title.includes('birthday')) {
                const name = event.title.replace(/birthday/gi, '').trim() || 'Unspecified';
                const dateObj = new Date(event.startDate);

                // Format the countdown
                const diffTime = Math.abs(dateObj.getTime() - now.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                eventOccasions.push({
                    id: event.id,
                    name: name,
                    type: 'Birthday',
                    date: format(dateObj, 'MMMM dd'),
                    countdown: `in ${diffDays}d`,
                    dotColor: 'red',
                });
            }
        });
    } catch (error) {
        console.error('Error fetching calendar events:', error);
    }

    return eventOccasions;
}
