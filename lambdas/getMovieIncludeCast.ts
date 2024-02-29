import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { MovieCastMemberQueryParams } from "../shared/types";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import Ajv from "ajv";
import schema from "../shared/types.schema.json";

// 创建 AJV 实例并编译模式
const ajv = new Ajv();
const isValidQueryParams = ajv.compile(
  schema.definitions["MovieCastMemberQueryParams"] || {}
);

// 创建 DynamoDB DocumentClient 实例
const ddbDocClient = createDocumentClient();

// 定义 Lambda 处理程序
export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("Event: ", event);

    // 获取路径参数和查询参数
    const { movieId } = event.pathParameters || {};
    const queryParams = event.queryStringParameters;

    // 检查是否缺少查询参数
    if (!queryParams) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "Missing query parameters" }),
      };
    }

    // 检查查询参数是否符合模式
    if (!isValidQueryParams(queryParams)) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          message: `Incorrect type. Must match Query parameters schema`,
          schema: schema.definitions["MovieCastMemberQueryParams"],
        }),
      };
    }

    // 构造 DynamoDB 查询命令参数
    let commandInput: QueryCommandInput = {
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "movieId = :m",
      ExpressionAttributeValues: {
        ":m": movieId,
      },
    };

    // 如果查询参数中包含 roleName，则添加角色名称条件
    if (queryParams.cast === 'true') {
      commandInput = {
        ...commandInput,
        IndexName: "roleIx",
        KeyConditionExpression: "movieId = :m",
        FilterExpression: "attribute_exists(roleName)", // 过滤掉没有角色名称的项
      };
    }

    // 发送 DynamoDB 查询命令并获取结果
    const commandOutput = await ddbDocClient.send(
      new QueryCommand(commandInput)
    );

    // 返回成功响应
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        data: commandOutput.Items,
      }),
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

// 创建 DynamoDB DocumentClient 实例的辅助函数
function createDocumentClient() {
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
