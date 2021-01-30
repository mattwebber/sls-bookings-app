import AWS from 'aws-sdk';

const ses = new AWS.SES({
  region: 'eu-west-1'
});

async function sendMail(event, context) {
    const record = event.Records[0];

    const email = JSON.parse(record.body);
    const { subject, body, recipient } = email;

    const params = {
        Source: process.env.ADMINISTRATOR_EMAIL_ADDRESS,
        Destination: {
            ToAddresses: [recipient],
        },
        Message: {
            Body: {
                Text: {
                    Data: body
                }
            },
            Subject: {
                Data: subject
            }
        }
    };

    try {
        console.log(`Sending mail from: "${process.env.ADMINISTRATOR_EMAIL_ADDRESS}" to: "${recipient}"`);
        await ses.sendEmail(params).promise();
    } catch(error) {
        console.error(error);
    }
}

export const handler = sendMail;


