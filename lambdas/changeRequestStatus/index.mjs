import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const dynamo = DynamoDBDocument.from(new DynamoDB());

export const handler = async (event) => {
    const { status: prayerStatus, id, createdDate } = JSON.parse(event.body);
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        // update current dynamoDB item with new status
        const prayer = await dynamo.update({
            TableName: 'PrayerRequests',
            Key: {
                id: id,
                date: createdDate,
            },
            UpdateExpression: 'SET prayerStatus = :prayerStatus',
            ExpressionAttributeValues: {
                ':prayerStatus': prayerStatus,
            },
        });
    } catch (err) {
        return {
            status: '400',
            body: JSON.stringify({ message: err.message, success: false }),
            headers,
        };
    }

    return {
        status: '200',
        body: JSON.stringify({
            message: `Updated ${id} to status:${prayerStatus}`,
            prayer,
            success: true,
        }),
        headers,
    };
};
