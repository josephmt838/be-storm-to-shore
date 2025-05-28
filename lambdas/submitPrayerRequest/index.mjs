import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

import { v4 as uuid } from 'uuid';

const dynamo = DynamoDBDocument.from(new DynamoDB());

export const handler = async (event) => {
    const {
        content: text,
        title = 'Prayer Request',
        name = '',
        email = '',
        isPublic = 'false',
        requestFollowUp: followUp = 'false',
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
    const id = uuid();
    const date = new Date().toLocaleDateString();

    const payload = {
        id,
        name,
        email,
        text,
        isPublic: isPublic ? 'true' : 'false',
        followUp: followUp ? 'true' : 'false',
        created_at: date,
        prayerStatus: 'PENDING',
        title,
        count: 0,
    };

    try {
        await dynamo.put({ TableName: 'PrayerRequest', Item: payload });
    } catch (err) {
        return {
            statusCode: '400',
            body: JSON.stringify({
                message: err.message,
                success: false,
            }),
        };
    }

    return {
        statusCode: '200',
        body: JSON.stringify({
            message: 'Successfully submitted Prayer Request!',
            success: true,
        }),
    };
};
