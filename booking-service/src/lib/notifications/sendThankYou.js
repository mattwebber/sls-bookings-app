import AWS from 'aws-sdk';

const sqs = new AWS.SQS();
const dynamodb = new AWS.DynamoDB.DocumentClient();

export const sendThankYou = async booking => {
    const { customerId, id } = booking;

    // Send thank you notification.
    await sqs.sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
            subject: 'Thank you for using our services!',
            recipient: customerId,
            body: 'We hope to see you again soon.'
        })
    }).promise();

    const params = {
        TableName: process.env.BOOKINGS_TABLE_NAME,
        Key: { id: id },
        UpdateExpression: 'set thankYouSent = :thankYouSentValue',
        ExpressionAttributeValues: {
            ':thankYouSentValue': true
        }
    };

    // Update the booking to mark the thank you notification as sent.
    await dynamodb.update(params).promise();
};