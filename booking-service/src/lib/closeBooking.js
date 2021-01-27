import AWS from 'aws-sdk';

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
};