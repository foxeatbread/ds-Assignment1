import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand, UpdateItemCommandInput, PutItemCommand, PutItemCommandInput  } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import Ajv from "ajv";
import schema from "../shared/types.schema.json";

const ajv = new Ajv();
const dynamodb = new DynamoDBClient({});
const ddbDocClient = createDynamoDBDocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    const parameters = event?.pathParameters;
    const reviewerName = parameters?.reviewerName;
    const movieId = parameters?.movieId;
    const body = event.body ? JSON.parse(event.body) : undefined;
    const rating = body.rating;

    console.log("Event: ", event);

    if (!body) {
      return {
        statusCode: 400,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }

    if (!movieId || !reviewerName) {
      return {
        statusCode: 400,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "Missing movieId, reviewerName" }),
      };
    }

    const putParams: PutItemCommandInput = {
      TableName: process.env.TABLE_NAME!,
      Item: {
        "movieId": { N: movieId.toString() },
        "reviewerName": { S: reviewerName },
        "content": { S: body.content },
        "reviewDate": { S: new Date().toISOString() },
        "rating": { N: rating.toString() },
      },
      ConditionExpression: "attribute_not_exists(movieId) AND attribute_not_exists(reviewerName)",
      ReturnValues: "NONE",
    };

    await ddbDocClient.send(new PutItemCommand(putParams));

    return {
      statusCode: 201,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: "Movie review modified" }),
    };
  } catch (error: any) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};

function createDynamoDBDocumentClient() {
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(dynamodb, translateConfig);
}