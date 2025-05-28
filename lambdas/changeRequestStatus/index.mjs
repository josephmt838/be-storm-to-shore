import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'PrayerRequest';

export const handler = async (event) => {
    try {
        // Extract prayer ID from the path
        const { id: prayerId } = event.pathParameters;

        if (!prayerId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing prayer ID in path',
                }),
            };
        }

        // Parse the request body
        let body;
        try {
            body = JSON.parse(event.body);
        } catch (e) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid request body',
                }),
            };
        }

        const { prayerStatus, isPublic, date } = body;

        if (!prayerStatus) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Missing required field: prayerStatus',
                }),
            };
        }

        // Validate prayerStatus
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
        if (!validStatuses.includes(prayerStatus)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message:
                        'Invalid prayerStatus. Must be one of: PENDING, APPROVED, REJECTED',
                }),
            };
        }

        // Update the prayer request status
        const params = {
            TableName: TABLE_NAME,
            Key: {
                isPublic: isPublic,
                id: prayerId,
            },
            UpdateExpression:
                'SET prayerStatus = :prayerStatus, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ':prayerStatus': prayerStatus,
                ':updatedAt': new Date().toISOString(),
            },
            ReturnValues: 'ALL_NEW',
        };

        const { Attributes } = await docClient.send(new UpdateCommand(params));

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Prayer request status updated successfully',
                prayerRequest: Attributes,
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error updating prayer request status',
                error: error.message,
            }),
        };
    }
};
