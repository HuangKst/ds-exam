import { Handler } from "aws-lambda";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export const handler: Handler = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));

    // Initialize SQS client (v3 SDK)
    const sqsClient = new SQSClient({ region: process.env.REGION });
    
    // Try to parse message content
    let payload;
    try {
      payload = typeof event === 'string' ? JSON.parse(event) : event;
    } catch (error) {
      console.error("Unable to parse message content:", error);
      return;
    }
    
    // Check if email field is missing
    if (!payload.email) {
      console.log("Message is missing email field, forwarding to QueueB");
      // Send message to QueueB
      await sqsClient.send(new SendMessageCommand({
        QueueUrl: process.env.QUEUE_B_URL!,
        MessageBody: JSON.stringify(payload),
      }));
    } else {
      console.log("Processing message with email:", payload.email);
      // Logic for handling normal messages with email
    }

  } catch (error: any) {
    throw new Error(JSON.stringify(error));
  }
};
