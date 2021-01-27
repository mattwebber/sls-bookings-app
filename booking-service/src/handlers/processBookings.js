import createError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';
import { getEndedBookings } from '../lib/getEndedBookings';
import { closeBooking } from '../lib/closeBooking';

const processBookings = async (event, context) => {
    try {
        const bookingsToClose = (await getEndedBookings());
        const closePromises = bookingsToClose.map(booking => closeBooking(booking));
        await Promise.all(closePromises);
        return { closedBookings: closePromises.length };
    } catch(error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }
};

export const handler = commonMiddleware(processBookings);