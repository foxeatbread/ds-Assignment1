import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    try {
        console.log("Event: ", event);
        const parameters = event?.pathParameters;
        const movieId = parameters?.movieId ? parseInt(parameters.movieId) : undefined;

        if (!movieId) {
            return {
                statusCode: 404,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ Message: "Missing movie Id" }),
            };
        }

        // Query reviews for the specified movieId
        const commandOutput = await ddbDocClient.send(
            new QueryCommand({
                TableName: process.env.TABLE_NAME,
                KeyConditionExpression: "movieId = :id",
                ExpressionAttributeValues: {
                    ":id": movieId,
                },
            })
        );

        const reviews = commandOutput.Items;

        if (!reviews || reviews.length === 0) {
            return {
                statusCode: 404,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ Message: "No reviews found for the specified movie Id" }),
            };
        }

        const body = {
            data: reviews,
        };

        // Return Response
        return {
            statusCode: 200,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(body),
        };
    } catch (error: any) {
        console.log(JSON.stringify(error));
        return {
            statusCode: 500,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ error }),
        };
    }
};

function createDDbDocClient() {
    const ddbClient = new DynamoDBClient({ region: process.env.REGION });
    const marshallOptions = {
        convertEmptyValues: true,
        removeUndefinedValues: true,
        convertClassInstanceToMap: true,
    };
    const unmarshallOptions = {
        wrapNumbers: false,
    };
    const translateConfig = { marshallOptions, unmarshallOptions };
    return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}