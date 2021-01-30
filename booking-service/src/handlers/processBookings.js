import createError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';
import { getEndedBookings } from '../lib/getEndedBookings';
import { getAllBookings } from '../lib/getAllBookings';
import { closeBooking } from '../lib/closeBooking';
import { sendReminder } from '../lib/notifications/sendReminder';

const processBookings = async (event, context) => {
    try {
        // Check for any ended bookings and then close them if necessary.
        const bookingsToClose = await getEndedBookings();
        const closePromises = bookingsToClose.map(booking => closeBooking(booking));
        await Promise.all(closePromises);

        // Check for any bookings that take place in the next 24 hours and send out reminders if necessary.
        const openBookings = await getAllBookings();
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate()+1);
        const bookingsToRemind = openBookings.filter(booking => !booking.reminderSent && new Date(booking.bookingTime) < tomorrow);
        if(bookingsToRemind.length > 0) {
            const reminderPromises = bookingsToRemind.map(booking => sendReminder(booking));
            await Promise.all(reminderPromises);
        }

        return { closedBookings: closePromises.length, remindersSent: bookingsToRemind.length };
    } catch(error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }
};

export const handler = commonMiddleware(processBookings);