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
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  // const replyText = `あなたのメッセージ: ${event.message.text}`;
  return client.replyMessage(replyMessageRequest);
}


export default handleReplyMessage;
