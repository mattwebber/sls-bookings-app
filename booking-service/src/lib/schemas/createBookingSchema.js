const schema = {
    properties: {
        body: {
            type: 'object',
            properties: {
                bookingTime: {
                    type: 'string',
                    format: 'date-time'
                }
            },
            required: ['bookingTime']
        }
    },
    required: ['body']
};

export default schema;