import AWS from 'aws-sdk';
import { sendThankYou } from './notifications/sendThankYou';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const closeBooking = async booking => {
    const params = {
        TableName: process.env.BOOKINGS_TABLE_NAME,
        Key: { id: booking.id },
        UpdateExpression: 'set #status = :status',
        ExpressionAttributeValues: {
            ':status': 'CLOSED'
        },
        ExpressionAttributeNames : {
            '#status': 'status'
        }
    };

    await dynamodb.update(params).promise();

    if(!booking.thankYouSent) {
        // Send thank you email to the customer.
        await sendThankYou(booking);
    }
};