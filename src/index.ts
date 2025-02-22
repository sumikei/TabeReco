import express, { Request, Response } from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { middleware } from "@line/bot-sdk";
import config from "./config";
import handleEvents from "./handler/common";
import handleReplyMessage from "./handler/handleReplyMessage";
import https from "https";

const app = express();
const PORT = process.env.PORT || 3001;
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN;

app.get("/", (req, res) => {
  res.send("Hello, Express with TypeScript!");
});

console.log("🔍 LINE_CHANNEL_SECRET:", process.env.LINE_CHANNEL_SECRET ? "✔ 設定済み" : "❌ 未設定");
console.log("🔍 LINE_ACCESS_TOKEN:", process.env.LINE_ACCESS_TOKEN ? "✔ 設定済み" : "❌ 未設定");

// Webhookエンドポイント
app.post("/webhook", middleware(config), (req: Request, res: Response) => {
  try {
    console.log("🔍 Webhook received:", JSON.stringify(req.body, null, 2));
    // await handleEvents(req.body.events, res, handleReplyMessage);

    const event = req.body.events[0];
    const regex = /食べたい|たべたい/i;
    const messages: any[] = [];

    // ユーザーがボットにメッセージを送った場合
    if (event.type === "message") {

      // 食べたいものリクエストがあった場合のみ応答する
      const userMessage: string = event.message.text;
      if (regex.test(userMessage)) {
        messages.push({
          type: "text",
          text: "リクエストを受け付けました",
        })
      }

      messages.push({
        type: "text",
        text: "これはテスト応答です",
      })

      // 応答メッセージを定義
      const dataString = JSON.stringify({
        replyToken: req.body.events[0].replyToken,
        messages
      });

      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + LINE_ACCESS_TOKEN,
      };

      const webhookOptions = {
        hostname: "api.line.me",
        path: "/v2/bot/message/reply",
        method: "POST",
        headers: headers,
        body: dataString,
      };

      // messageタイプのHTTP POSTリクエストが/webhookエンドポイントに送信された場合、
      // 変数webhookOptionsで定義したhttps://api.line.me/v2/bot/message/replyに対して
      // HTTP POSTリクエストを送信する

      // リクエストの定義
      const request = https.request(webhookOptions, (res) => {
        res.on("data", (d) => {
          process.stdout.write(d);
        });
      });

      request.on("error", (err) => {
        console.error(err);
      });

      // 最後に、定義したリクエストを送信
      request.write(dataString);
      request.end();
    }

  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.sendStatus(500);
  }
});


export default app;
