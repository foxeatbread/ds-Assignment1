"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lambdas/getMovieById.ts
var getMovieById_exports = {};
__export(getMovieById_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(getMovieById_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var ddbDocClient = createDDbDocClient();
var handler = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event?.queryStringParameters));
    const parameters = event?.pathParameters;
    const queryParams = event.queryStringParameters;
    const movieId = parameters?.movieId ? parseInt(parameters.movieId) : void 0;
    if (!movieId) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ Message: "Missing movie Id" })
      };
    }
    let movieData = null;
    let castData = null;
    let responseData = null;
    if (queryParams && queryParams.cast === "true") {
      const movieCommandInput = {
        TableName: process.env.TABLE_NAME_MOVIES,
        Key: { id: movieId }
      };
      const castCommandInput = {
        TableName: process.env.TABLE_NAME_MOVIE_CASTS,
        KeyConditionExpression: "movieId = :m",
        // 设置主键条件表达式
        ExpressionAttributeValues: {
          ":m": movieId
          // 设置 movieId 参数的值
        }
      };
      const [movieOutput, castOutput] = await Promise.all([
        ddbDocClient.send(new import_lib_dynamodb.GetCommand(movieCommandInput)),
        ddbDocClient.send(new import_lib_dynamodb.QueryCommand(castCommandInput))
      ]);
      if (!movieOutput.Item) {
        return {
          statusCode: 404,
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ Message: "Invalid movie Id" })
        };
      }
      movieData = movieOutput.Item;
      castData = castOutput.Items;
      responseData = {
        "movie": movieData,
        "cast": castData
      };
    } else {
      const commandOutput = await ddbDocClient.send(
        new import_lib_dynamodb.GetCommand({
          TableName: process.env.TABLE_NAME_MOVIES,
          Key: { id: movieId }
        })
      );
      console.log("GetCommand response: ", commandOutput);
      if (!commandOutput.Item) {
        return {
          statusCode: 404,
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({ Message: "Invalid movie Id" })
        };
      }
      movieData = commandOutput.Item;
      responseData = {
        movieData
      };
    }
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ error })
    };
  }
};
function createDDbDocClient() {
  const ddbClient = new import_client_dynamodb.DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true
  };
  const unmarshallOptions = {
    wrapNumbers: false
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return import_lib_dynamodb.DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
