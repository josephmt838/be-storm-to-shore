import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const dynamoDB = DynamoDBDocument.from(new DynamoDB());

const TABLE_NAME = 'StormToShoreArticles';

export const handler = async (event) => {
    try {
        console.log(event);
        const { id } = event.pathParameters;

        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: {
                        message: 'Article ID is required',
                        code: 'MISSING_ID',
                    },
                }),
            };
        }

        const params = {
            TableName: TABLE_NAME,
            Key: {
                id: id,
            },
        };

        const result = await dynamoDB.get(params);

        if (!result.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    error: {
                        message: 'Article not found',
                        code: 'NOT_FOUND',
                    },
                }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.Item),
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
