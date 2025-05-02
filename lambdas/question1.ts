import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));
    const movieIdParam = event.pathParameters?.movieId;
    if (!movieIdParam) {
      return { statusCode: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ message: "Missing movieId parameter" }) };
    }
    const movieId = Number(movieIdParam);
    if (isNaN(movieId)) {
      return { statusCode: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ message: "Invalid movieId parameter" }) };
    }
    const roleParam = event.queryStringParameters?.role;
    if (roleParam) {
      // 查询指定角色
      const getCmd = new GetCommand({ TableName: process.env.TABLE_NAME!, Key: { movieId, role: roleParam } });
      const res = await client.send(getCmd);
      if (!res.Item) {
        return { statusCode: 404, headers: { "content-type": "application/json" }, body: JSON.stringify({ message: "Crew not found" }) };
      }
      return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(res.Item) };
    } else {
      // 查询所有 crew
      const queryCmd = new QueryCommand({
        TableName: process.env.TABLE_NAME!,
        KeyConditionExpression: "movieId = :m",
        ExpressionAttributeValues: { ":m": movieId },
      });
      const res = await client.send(queryCmd);
      if (!res.Items || res.Items.length === 0) {
        return { statusCode: 404, headers: { "content-type": "application/json" }, body: JSON.stringify({ message: "No crew found" }) };
      }
      return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(res.Items) };
    }
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return { statusCode: 500, headers: { "content-type": "application/json" }, body: JSON.stringify({ error }) };
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
