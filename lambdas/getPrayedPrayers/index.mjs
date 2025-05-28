import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
    try {
        console.log(event);
        // Get user ID from the authenticated request
        const { userId } = event.queryStringParameters;

        // Query the prayer_participants table using the LSI
        const params = {
            TableName: 'PrayerParticipants',
            IndexName: 'UserIdIndex', // Replace with your actual LSI name
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId,
            },
        };

        const result = await dynamoDB.query(params).promise();

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(result.Items),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
