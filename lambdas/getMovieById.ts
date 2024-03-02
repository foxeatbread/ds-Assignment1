import { Handler } from "aws-lambda";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput, GetCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    // Print Event
    console.log("Event: ", JSON.stringify(event?.queryStringParameters));
    const parameters  = event?.pathParameters;
    const queryParams = event.queryStringParameters;
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

    let movieData: any = null;
    let castData: any = null;
    let responseData: any = null;

    if (queryParams && queryParams.cast === 'true') {
      // 如果查询参数中包含 cast=true，则查询两个表
      const movieCommandInput = {
        TableName: process.env.TABLE_NAME_MOVIES,
        Key: { id: movieId },
      };
      const castCommandInput = {
        TableName: process.env.TABLE_NAME_MOVIE_CASTS, 
        KeyConditionExpression: "movieId = :m", // 设置主键条件表达式
        ExpressionAttributeValues: {
          ":m": movieId, // 设置 movieId 参数的值
        },
      };
      
      const [movieOutput, castOutput] = await Promise.all([
        ddbDocClient.send(new GetCommand(movieCommandInput)),
        ddbDocClient.send(new QueryCommand(castCommandInput))
      ]);

      if (!movieOutput.Item) {
        return {
          statusCode: 404,
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ Message: "Invalid movie Id" }),
        };
      }
      
      movieData = movieOutput.Item;
      castData = castOutput.Items;
      responseData = {
        "movie":movieData,
        "cast":castData
      };
    }  else {
      const commandOutput = await ddbDocClient.send(
        new GetCommand({
          TableName: process.env.TABLE_NAME_MOVIES,
          Key: { id: movieId },
        })
      );
      console.log("GetCommand response: ", commandOutput);

      if (!commandOutput.Item) {
        return {
          statusCode: 404,
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ Message: "Invalid movie Id" }),
        };
      }
      
      movieData = commandOutput.Item;
      responseData = {
        movieData,
      };
    }
        


    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(responseData),
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
