import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const dynamoDB = DynamoDBDocument.from(new DynamoDB());

const TABLE_NAME = 'StormToShoreArticles';

// Input validation function
const validateArticle = (article) => {
    const requiredFields = [
        'title',
        'description',
        'content',
        'category',
        'duration',
    ];
    const errors = [];

    requiredFields.forEach((field) => {
        if (!article[field]) {
            errors.push(`${field} is required`);
        }
    });

    if (
        article.title &&
        (article.title.length < 3 || article.title.length > 200)
    ) {
        errors.push('Title must be between 3 and 200 characters');
    }

    if (article.description && article.description.length > 500) {
        errors.push('Description must be less than 500 characters');
    }

    const validCategories = ['Teaching', 'Devotional', 'Resource', 'Article'];
    if (article.category && !validCategories.includes(article.category)) {
        errors.push('Invalid category');
    }

    return errors;
};

export const handler = async (event) => {
    try {
        const article = JSON.parse(event.body);

        const validationErrors = validateArticle(article);
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
        const articleData = {
            id: uuidv4(),
            title: article.title,
            description: article.description,
            content: article.content,
            category: article.category,
            duration: article.duration,
            featured: article.featured || false,
            date: article.date || timestamp,
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        const params = {
            TableName: TABLE_NAME,
            Item: articleData,
            ConditionExpression: 'attribute_not_exists(id)',
        };

        await dynamoDB.put(params);

        const response = {
            data: articleData,
            message: 'Article created successfully',
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
                        message: 'Article with this ID already exists',
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
