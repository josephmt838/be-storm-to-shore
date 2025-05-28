import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const { limit = 20, lastEvaluatedKey } =
            event.queryStringParameters || {};

        const command = new QueryCommand({
            TableName: 'ContactMessages',
            IndexName: 'messageStatus-index',
            KeyConditionExpression: 'messageStatus = :status',
            ExpressionAttributeValues: {
                ':status': 'NEW',
            },
            ScanIndexForward: false,
            Limit: parseInt(limit),
            ...(lastEvaluatedKey && {
                ExclusiveStartKey: JSON.parse(lastEvaluatedKey),
            }),
        });

        const response = await docClient.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                messages: response.Items,
                count: response.Count,
                lastEvaluatedKey: response.LastEvaluatedKey,
                hasMore: !!response.LastEvaluatedKey,
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error fetching contact messages',
                error: error.message,
            }),
        };
    }
};
