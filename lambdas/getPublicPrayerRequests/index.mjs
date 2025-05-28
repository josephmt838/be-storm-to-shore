import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'PrayerRequest';

export const handler = async (event) => {
    try {
        // Get query parameters
        const queryParams = event.queryStringParameters || {};

        let allItems = [];

        // Get only public and approved prayers
        const publicParams = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'isPublic = :isPublic',
            FilterExpression: 'prayerStatus = :prayerStatus',
            ExpressionAttributeValues: {
                ':isPublic': 'true',
                ':prayerStatus': 'APPROVED',
            },
            ScanIndexForward: false, // Sort in descending order (newest first)
            Limit: 50,
        };

        const { Items: publicItems } = await docClient.send(
            new QueryCommand(publicParams),
        );
        allItems = publicItems;

        return {
            statusCode: 200,
            body: JSON.stringify(allItems),
        };
    } catch (error) {
        console.error('Error getting prayer requests:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error getting prayer requests' }),
        };
    }
};
