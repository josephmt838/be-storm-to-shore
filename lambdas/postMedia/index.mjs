import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const dynamoDB = DynamoDBDocument.from(new DynamoDB());

const TABLE_NAME = 'StormToShoreMedia';

// Input validation function
const validateMedia = (media) => {
    const requiredFields = [
        'title',
        'description',
        'type',
        'category',
        'duration',
        'link',
        'thumbnail',
    ];
    const errors = [];

    requiredFields.forEach((field) => {
        if (!media[field]) {
            errors.push(`${field} is required`);
        }
    });

    if (media.title && (media.title.length < 3 || media.title.length > 200)) {
        errors.push('Title must be between 3 and 200 characters');
    }

    if (media.description && media.description.length > 500) {
        errors.push('Description must be less than 500 characters');
    }

    const validCategories = [
        'Teaching',
        'Devotional',
        'Sermon',
        'Testimony',
        'Worship',
    ];
    if (media.category && !validCategories.includes(media.category)) {
        errors.push('Invalid category');
    }

    return errors;
};

export const handler = async (event) => {
    try {
        const media = JSON.parse(event.body);

        const validationErrors = validateMedia(media);
        if (validationErrors.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: {
                        message: 'Validation failed',
                        code: 'VALIDATION_ERROR',
                        details: validationErrors,
                    },
                }),
            };
        }

        const timestamp = new Date().toISOString();
        const mediaData = {
            id: uuidv4(),
            title: media.title,
            description: media.description,
            content: media.content,
            category: media.category,
            duration: media.duration,
            featured: media.featured || false,
            date: media.date || timestamp,
            link: media.link,
            thumbnail: media.thumbnail,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const params = {
            TableName: TABLE_NAME,
            Item: mediaData,
            ConditionExpression: 'attribute_not_exists(id)',
        };

        await dynamoDB.put(params);

        const response = {
            data: mediaData,
            message: 'Media created successfully',
        };

        return {
            statusCode: 201,
            body: JSON.stringify(response),
        };
    } catch (error) {
        console.error('Error:', error);

        if (error.code === 'ConditionalCheckFailedException') {
            return {
                statusCode: 409,
                body: JSON.stringify({
                    error: {
                        message: 'Media with this ID already exists',
                        code: 'DUPLICATE_ID',
                    },
                }),
            };
        }

        if (error instanceof SyntaxError) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: {
                        message: 'Invalid JSON in request body',
                        code: 'INVALID_JSON',
                    },
                }),
            };
        }

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
