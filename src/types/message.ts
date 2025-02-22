interface ReplyMessage {
  type: "text";
  text: string;
}

export interface ReplyMessageRequest {
  replyToken: string;
  messages: ReplyMessage[];
}