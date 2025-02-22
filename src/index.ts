import express, { Request, Response } from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { middleware } from "@line/bot-sdk";
import config from "./config";
import handleEvents from "./handler/common";
import handleReplyMessage from "./handler/handleReplyMessage";


const app = express();
const PORT = process.env.PORT || 3001;
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

app.get("/", (req, res) => {
  res.send("Hello, Express with TypeScript!");
});

console.log("🔍 LINE_CHANNEL_SECRET:", process.env.LINE_CHANNEL_SECRET ? "✔ 設定済み" : "❌ 未設定");
console.log("🔍 LINE_ACCESS_TOKEN:", process.env.LINE_ACCESS_TOKEN ? "✔ 設定済み" : "❌ 未設定");

// Webhookエンドポイント
app.post("/webhook", middleware(config), async (req: Request, res: Response): Promise<void> => {
  if (!req.body.events || req.body.events.length === 0) {
    console.log("🔍 Webhookの検証リクエストを受信");
    res.status(200).send("Webhook verification success!");
    return;
  }
  await handleEvents(req.body.events, res, handleReplyMessage);
});


export default app;
