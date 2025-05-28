import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'ContactMessages';

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const timestamp = new Date().toISOString();
        const id = `msg_${Date.now()}`;
        const ttl = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

        const params = {
            TableName: TABLE_NAME,
            Item: {
                id,
                messageStatus: 'NEW',
                name: body.name,
                email: body.email,
                message: body.message,
                createdAt: timestamp,
                updatedAt: timestamp,
                responded: 'false',
                ttl: ttl,
            },
        };

        await docClient.send(new PutCommand(params));

        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Contact message created successfully',
                id,
            }),
        };
    } catch (error) {
        console.error('Error creating contact message:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error creating contact message' }),
        };
    }
};
