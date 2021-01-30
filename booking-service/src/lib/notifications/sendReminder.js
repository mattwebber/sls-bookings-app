import AWS from 'aws-sdk';

const sqs = new AWS.SQS();
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const sendReminder = async booking => {
    const { bookingTime, customerId, id } = booking;

    // Send reminder notification.
    await sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'Booking appointment reminder',
            recipient: customerId,
            body: `We are emailing you to remind you that you have an appointment booked for ${new Date(bookingTime).toLocaleTimeString()} tomorrow`
        })
    }).promise();

    const params = {
        TableName: process.env.BOOKINGS_TABLE_NAME,
        Key: { id: id },
        UpdateExpression: 'set reminderSent = :reminderValue',
        ExpressionAttributeValues: {
            ':reminderValue': true
        }
    };

    // Update the booking to mark the reminder notification as sent.
    await dynamodb.update(params).promise();
};