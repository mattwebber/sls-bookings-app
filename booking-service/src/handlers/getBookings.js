import createError from 'http-errors';
import commonMiddleware from '../lib/commonMiddleware';
import { getAllBookings } from '../lib/getAllBookings';

const getBookings = async (event, context) => {
    try {
        const bookings = (await getAllBookings()).map(booking => ({
            id: booking.id,
            bookingTime: booking.bookingTime
        }));
        return {
            statusCode: 200,
            body: JSON.stringify({ bookings })
        };
    } catch(error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }
};

export const handler = commonMiddleware(getBookings);