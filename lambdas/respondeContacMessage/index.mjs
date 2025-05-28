import AWS from 'aws-sdk';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
    try {
        const messageId = event.pathParameters.id;

        const params = {
            TableName: 'ContactMessages',
            Key: { id: messageId },
            UpdateExpression:
                'SET responded = :responded, updatedAt = :updatedAt, messageStatus = :messageStatus',
            ExpressionAttributeValues: {
                ':responded': 'true',
                ':updatedAt': new Date().toISOString(),
                ':messageStatus': 'RESPONDED',
            },
            ReturnValues: 'ALL_NEW',
        };

        const result = await dynamoDB.update(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Contact message updated successfully',
                data: result.Attributes,
            }),
        };
    } catch (error) {
        console.error('Error updating contact message:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error updating contact message',
                error: error.message,
            }),
        };
    }
};
