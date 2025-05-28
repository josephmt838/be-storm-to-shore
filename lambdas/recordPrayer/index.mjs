import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
    try {
        // Get user ID from the authenticated request
        const { userId, prayerId } = JSON.parse(event.body);

        // Check if user has already prayed for this request
        const checkParams = {
            TableName: 'PrayerParticipants',
            Key: {
                prayerId: prayerId,
                userId: userId,
            },
        };

        const existingPrayer = await dynamoDB.get(checkParams).promise();

        if (existingPrayer.Item) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                },
                body: JSON.stringify({
                    message: 'You have already prayed for this request',
                }),
            };
        }

        // First, add the user to prayer_participants
        const putParams = {
            TableName: 'PrayerParticipants',
            Item: {
                prayerId: prayerId,
                userId: userId,
                timestamp: new Date().toISOString(),
            },
        };

        const putResult = await dynamoDB.put(putParams).promise();

        // Then, increment the prayer count
        const updateParams = {
            TableName: 'PrayerRequest',
            Key: { isPublic: 'true', id: prayerId },
            UpdateExpression: 'ADD #count :inc',
            ExpressionAttributeNames: {
                '#count': 'count',
            },
            ExpressionAttributeValues: {
                ':inc': 1,
            },
        };

        const updateResult = await dynamoDB.update(updateParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Prayer recorded successfully',
                prayerId,
                userId,
            }),
        };
    } catch (error) {
        // Log the full error details
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            requestId: error.requestId,
            statusCode: error.statusCode,
            retryable: error.retryable,
            stack: error.stack,
        });

        // Check for specific DynamoDB errors
        if (error.code === 'ValidationException') {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid request parameters',
                    error: error.message,
                }),
            };
        }

        if (error.code === 'ResourceNotFoundException') {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Prayer request not found',
                    error: error.message,
                }),
            };
        }

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
                error: error.message,
            }),
        };
    }
};
