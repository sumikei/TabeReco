import { LineBotConfig } from "../types/config";

const config: LineBotConfig = {
  channelAccessToken: process.env.LINE_ACCESS_TOKEN ?? "",
  channelSecret: process.env.LINE_CHANNEL_SECRET ?? ""
};

export default config;
