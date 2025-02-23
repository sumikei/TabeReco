import axios from "axios";
import { LINE_HEADERS, REPLY_ENDPOINT } from "../const/api";
import { ReplyMessageRequest } from "../types/message"


export const sendReplyApi = async (payload: ReplyMessageRequest) => {
  try {
    await axios.post(
      REPLY_ENDPOINT,
      payload,
      {
        headers: LINE_HEADERS
      }
    )
  } catch (error) {
    console.error("Error sending reply message:", error);
  }
}
