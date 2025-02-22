import { ReplyMessageRequest } from "../types/message";
import { LineBotConfig } from "../types/config";
import { messagingApi, WebhookEvent } from "@line/bot-sdk";
import config from "../config";


const { MessagingApiClient } = messagingApi;
const client = new MessagingApiClient(config);

const replyMessageRequest: ReplyMessageRequest = {
  replyToken: "text",
  messages: [
    {
      type: "text",
      text: "test返信です"
    }
  ]
}

const handleReplyMessage = async (event: WebhookEvent) => {
  console.log("handleReplyMessage -- Start");
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }
  console.log("🔍 Received event:", JSON.stringify(event, null, 2));

  if (!event.replyToken) {
    console.error("❌ Error: Missing replyToken in event");
    return null;
  }
  console.log("🟢 Valid replyToken:", event.replyToken);

  // const replyText = `あなたのメッセージ: ${event.message.text}`;
  return await client.replyMessage(replyMessageRequest);
}


export default handleReplyMessage;
