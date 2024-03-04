import { Handler } from "aws-lambda";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand} from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {     // Note change
    try {
        console.log("Event: ", event);
        const parameters = event?.pathParameters;
        const reviewerName = parameters?.reviewerName;

        const commandOutput = await ddbDocClient.send(
            new ScanCommand({
                TableName: process.env.TABLE_NAME,
            })
        );
        if (!commandOutput.Items) {
            // 处理 Items 未定义的情况，可能是没有找到匹配的项
            return {
                statusCode: 404,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ Message: "No reviews found for the specified movie and reviewer" }),
            };
        }
        
        // 如果 commandOutput.Items 不是 undefined，则执行过滤操作
        const reviews = commandOutput.Items;
        const filteredReviews = reviews.filter(item => 
            item.reviewerName.includes(reviewerName)
        );



        if (!filteredReviews || filteredReviews.length === 0) {
            return {
                statusCode: 404,
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({ Message: "No reviews found for the specified movie and reviewer" }),
            };
        }

        const body = {
            data1: filteredReviews,
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