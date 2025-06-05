import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const dynamoDB = DynamoDBDocument.from(new DynamoDB());

const TABLE_NAME = 'StormToShoreMedia';

export const handler = async (event) => {
    try {
        const params = {
            TableName: TABLE_NAME,
        };

        const result = await dynamoDB.scan(params);

        return {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: {
                    message: 'Internal server error',
                    code: 'INTERNAL_ERROR',
                },
            }),
        };
    }
};
