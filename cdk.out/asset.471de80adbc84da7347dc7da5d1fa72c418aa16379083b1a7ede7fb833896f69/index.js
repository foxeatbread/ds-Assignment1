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

// lambdas/getMovieIncludeCast.ts
var getMovieIncludeCast_exports = {};
__export(getMovieIncludeCast_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(getMovieIncludeCast_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var ddbDocClient = createDynamoDBDocumentClient();
var handler = async (event, context) => {
  try {
    const parameters = event?.pathParameters;
    const movieId = parameters?.movieId ? parseInt(parameters.movieId) : void 0;
    if (!movieId) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ message: "Missing movie Id" })
      };
    }
    const queryParams = event.queryStringParameters;
    const includeCast = queryParams?.cast === "true";
    const movieData = await getMovieData(movieId);
    if (!movieData) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ message: "Invalid movie Id" })
      };
    }
    let responseData = { movieData };
    if (includeCast) {
      const castData = await getCastMembers(movieId);
      responseData.castData = castData;
    }
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ error: "Internal Server Error" })
    };
  }
};
async function getMovieData(movieId) {
  try {
    const commandOutput = await ddbDocClient.send(
      new import_lib_dynamodb.GetCommand({
        TableName: process.env.TABLE_NAME_MOVIES,
        Key: { id: movieId }
      })
    );
    return commandOutput.Item;
  } catch (error) {
    console.error("Error fetching movie data:", error);
    return null;
  }
}
async function getCastMembers(movieId) {
  try {
    const commandOutput = await ddbDocClient.send(
      new import_lib_dynamodb.QueryCommand({
        TableName: process.env.TABLE_NAME_CAST_MEMBERS,
        KeyConditionExpression: "movieId = :m",
        ExpressionAttributeValues: {
          ":m": movieId
        }
      })
    );
    return commandOutput.Items;
  } catch (error) {
    console.error("Error fetching cast members:", error);
    return [];
  }
}
function createDynamoDBDocumentClient() {
  const ddbClient = new import_client_dynamodb.DynamoDBClient({ region: process.env.REGION });
  const docClient = import_lib_dynamodb.DynamoDBDocumentClient.from(ddbClient);
  return docClient;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
