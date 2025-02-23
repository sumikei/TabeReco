import express, { Request, Response } from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { middleware } from "@line/bot-sdk";
import config from "./config";
import { sendReplyApi } from "./handler/apiHandler";
import { createMealRecord } from "./controllers/mealController";


const app = express();
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

app.get("/", (req, res) => {
  res.send("Hello, Express with TypeScript!");
});

console.log("🔍 LINE_CHANNEL_SECRET:", process.env.LINE_CHANNEL_SECRET ? "✔ 設定済み" : "❌ 未設定");
console.log("🔍 LINE_ACCESS_TOKEN:", process.env.LINE_ACCESS_TOKEN ? "✔ 設定済み" : "❌ 未設定");

// Webhookエンドポイント
app.post("/webhook", middleware(config), async (req: Request, res: Response) => {
  try {
    console.log("🔍 Webhook received:", JSON.stringify(req.body, null, 2));

    const event = req.body.events[0];
    const messages: any[] = [];

    // ユーザーがボットにメッセージを送った場合
    if (event.type === "message") {

      const userMessage: string = event.message.text;
      if (userMessage == "食事を記録する") {
        messages.push({
          type: "text",
          text: "何を食べましたか？",
        })
      } else if (userMessage == "履歴検索する") {
        // TODO: DBからデータ取得して結果を返却する
        messages.push({
          type: "text",
          text: "履歴検索の要求を受け付けました",
        })
      } else {
        // 食事記録フローの2回目入力を想定。テキスト入力での送信は考慮外

        const now = new Date()
        createMealRecord(userMessage, now)

        messages.push({
          type: "text",
          text: "食事記録を保存しました",
        })
        console.log("🔍 Message Pushed -- " + userMessage);
      }

      // 応答メッセージを送信
      await sendReplyApi({
          replyToken: event.replyToken,
          messages
      });

      res.sendStatus(200)
    }

  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.sendStatus(500);
  }
});


export default app;
