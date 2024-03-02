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

// lambdas/getAllMovies.ts
var getAllMovies_exports = {};
__export(getAllMovies_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(getAllMovies_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var ddbDocClient = createDDbDocClient();
var handler = async (event, context) => {
  try {
    console.log("Event: ", event);
    const parameters = event?.pathParameters;
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
    const queryParams = event.queryStringParameters;
    const includeCast = queryParams?.cast === "true";
    if (includeCast) {
      const [movieData, castData] = await Promise.all([
        getMovieData(movieId),
        getCastMembers(movieId)
      ]);
      return {
        statusCode: 200,
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ movieData, castData })
      };
    } else {
      const movieData = await getMovieData(movieId);
      return {
        statusCode: 200,
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ movieData })
      };
    }
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
    throw error;
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
    throw error;
  }
}
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
