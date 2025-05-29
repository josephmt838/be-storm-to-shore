import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const dynamoDB = DynamoDBDocument.from(new DynamoDB());

const TABLE_NAME = 'SubscriptionStormToShore';

export const handler = async (event) => {
    try {
        const { email } = JSON.parse(event.body);

        if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid email address',
                }),
            };
        }

        const existingSubscription = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: {
                email: email,
                isSubscribed: 1
            }
        });

        if (existingSubscription.Item) {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    message: 'Email already subscribed',
                }),
            };
        }

        const subscription = {
            email,
            isSubscribed: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: subscription,
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Successfully subscribed',
                data: {
                    email: subscription.email,
                    createdAt: subscription.createdAt,
                },
            }),
        };
    } catch (error) {
        console.error('Error processing subscription:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error processing subscription',
                error: error.message,
            }),
        };
    }
};
