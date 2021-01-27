import AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const getEndedBookings = async () => {
    const now = new Date();
    const params = {
        TableName: process.env.BOOKINGS_TABLE_NAME,
        IndexName: 'statusAndBookingTimeIndex',
        KeyConditionExpression: '#status = :status AND bookingTime >= :now',
        ExpressionAttributeValues: {
            ':status': 'OPEN',
            ':now': now.toISOString()
        },
        ExpressionAttributeNames: {
            '#status': 'status'
        }
    };

    const result = await dynamodb.query(params).promise();
    return result.Items;
};