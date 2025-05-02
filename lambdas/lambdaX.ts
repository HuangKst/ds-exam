import { Handler } from "aws-lambda";

export const handler: Handler = async (event, context) => {
  try {
    console.log("Received SQS event with records: ", JSON.stringify(event.Records));
    for (const record of event.Records) {
      const snsMessage = JSON.parse(record.body);
      const payload = JSON.parse(snsMessage.Message);
      console.log("Processed payload in LambdaX: ", payload);
    }
  } catch (error: any) {
    throw new Error(JSON.stringify(error));
  }
};
