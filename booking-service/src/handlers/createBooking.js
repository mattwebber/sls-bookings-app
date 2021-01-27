import AWS from 'aws-sdk';
import createError from 'http-errors';
import validator from '@middy/validator';
import { v4 as uuid } from 'uuid';
import commonMiddleware from '../lib/commonMiddleware';
import { getBookings } from '../lib/getBookings';
import createBookingSchema from '../lib/schemas/createBookingSchema';

const dynamodb = new AWS.DynamoDB.DocumentClient();

const createBooking = async (event, context) => {
    const { email } = event.requestContext.authorizer;
    let { bookingTime } = event.body;
    bookingTime = (new Date(bookingTime));
    bookingTime.setMinutes(0, 0, 0); // Bookings must be on the hour.
    const now = new Date();

    // Validate the booking is in the future.
    if(bookingTime <= now) {
        throw new createError.Forbidden('Bookings must be in the future!');
    }

    // Validate that the booking is on a week day.
    const isWeekday = bookingTime.getDay() > 0 && bookingTime.getDay() < 6;
    if(!isWeekday) {
        throw new createError.Forbidden('Bookings must be on a weekday.');
    }

    // Validate that the booking starts between 9am and 4pm.
    const isBetween9and5 = bookingTime.getHours() >= 9 && bookingTime.getHours() <= 16;
    if(!isBetween9and5) {
        throw new createError.Forbidden('Bookings must be between 9am and 5pm.');
    }

    const bookings = await getBookings();
    // Validate the booking slot is available.
    const isUnavailable = bookings.map(booking => booking.bookingTime).includes(bookingTime.toISOString());
    if(isUnavailable) {
        throw new createError.Forbidden('That time is already taken.');
    }

    let newBooking;
    try {
        newBooking = {
            id: uuid(),
            customerId: email,
            status: 'OPEN',
            bookingTime: bookingTime.toISOString(),
            reminderSent: false,
            thankYouSent: false
        };

        await dynamodb.put({
            TableName: process.env.BOOKINGS_TABLE_NAME,
            Item: newBooking
        }).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({ bookingId: newBooking.id }),
        };
    } catch(error) {
        console.error(error);
        throw new createError.InternalServerError(error);
    }
};

export const handler = commonMiddleware(createBooking)
    .use(validator({ inputSchema: createBookingSchema }));