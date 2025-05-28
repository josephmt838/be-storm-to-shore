import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'PrayerRequest';

export const handler = async (event) => {
    try {
        let allItems = [];
        // Get both public and private prayers
        const publicParams = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'isPublic = :isPublic',
            ExpressionAttributeValues: {
                ':isPublic': 'true',
            },
            ScanIndexForward: false,
            Limit: 50,
        };

        const privateParams = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'isPublic = :isPublic',
            ExpressionAttributeValues: {
                ':isPublic': 'false',
            },
            ScanIndexForward: false,
            Limit: 50,
        };

        const [publicResult, privateResult] = await Promise.all([
            docClient.send(new QueryCommand(publicParams)),
            docClient.send(new QueryCommand(privateParams)),
        ]);

        // Combine and sort all items by createdAt
        allItems = [...publicResult.Items, ...privateResult.Items]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 50); // Limit total results to 50

        return {
            statusCode: 200,
            body: JSON.stringify(allItems),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error getting prayer requests' }),
        };
    }
};
