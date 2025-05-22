import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { v4 as uuid } from 'uuid';

const dynamo = DynamoDBDocument.from(new DynamoDB());

export const handler = async (event) => {
    const {
        text,
        name = '',
        email = '',
        isPublic = false,
        followUp = false,
    } = JSON.parse(event.body);
    const headers = {
        'Content-Type': 'application/json',
    };

    if (!text) {
        return {
            statusCode: '400',
            body: JSON.stringify({
                message: 'No Prayer Request was in request data',
                success: false,
            }),
            headers,
        };
    }

    const payload = {
        name,
        email,
        text,
        id: uuid(),
        isPublic: JSON.stringify(isPublic),
        followUp: JSON.stringify(followUp),
        date: new Date().toLocaleDateString(),
        status: 'PENDING',
    };

    try {
        await dynamo.put({ TableName: 'PrayerRequests', Item: payload });
    } catch (err) {
        return {
            statusCode: '400',
            body: JSON.stringify({
                message: err.message,
                success: false,
            }),
            headers,
        };
    }

    return {
        statusCode: '200',
        body: JSON.stringify({
            message: 'Successfully submitted Prayer Request!',
            success: true,
        }),
        headers,
    };
};
