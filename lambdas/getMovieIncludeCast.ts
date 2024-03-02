import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDynamoDBDocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
    try {
        const parameters = event?.pathParameters;
        const movieId = parameters?.movieId ? parseInt(parameters.movieId) : undefined;
        if (!movieId) {
            return {
                statusCode: 404,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ message: "Missing movie Id" }),
            };
        }

        const queryParams = event.queryStringParameters;
        const includeCast = queryParams?.cast === 'true';

        const movieData = await getMovieData(movieId);
        if (!movieData) {
            return {
                statusCode: 404,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ message: "Invalid movie Id" }),
            };
        }

        let responseData: any = { movieData };

        if (includeCast) {
            const castData = await getCastMembers(movieId);
            responseData.castData = castData;
        }

        return {
            statusCode: 200,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(responseData),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};

async function getMovieData(movieId: number) {
    try {
        const commandOutput = await ddbDocClient.send(
            new GetCommand({
                TableName: process.env.TABLE_NAME_MOVIES,
                Key: { id: movieId },
            })
        );
        return commandOutput.Item;
    } catch (error) {
        console.error("Error fetching movie data:", error);
        return null;
    }
}

async function getCastMembers(movieId: number) {
    try {
        const commandOutput = await ddbDocClient.send(
            new QueryCommand({
                TableName: process.env.TABLE_NAME_CAST_MEMBERS,
                KeyConditionExpression: "movieId = :m",
                ExpressionAttributeValues: {
                    ":m": movieId,
                },
            })
        );
        return commandOutput.Items;
    } catch (error) {
        console.error("Error fetching cast members:", error);
        return [];
    }
}

function createDynamoDBDocumentClient() {
    const ddbClient = new DynamoDBClient({ region: process.env.REGION });
    const docClient = DynamoDBDocumentClient.from(ddbClient);
    return docClient;
}