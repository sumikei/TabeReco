import express, { Request, Response, RequestHandler } from "express";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { middleware } from "@line/bot-sdk";
import config from "./config";
import { sendReplyApi } from "./handler/apiHandler";
import { createMealRecord, getElapsedTimeSinceLastMeal } from "./controllers/mealController";
import { setUserMode, getUserMode } from "./controllers/userStateController"
import { RECORD_MODE, SEARCH_MODE } from "./const/model";


const app = express();
const myEnv = dotenv.config();
dotenvExpand.expand(myEnv);

app.get("/", (req, res) => {
  res.send("Hello, This is TabeReco Service!");
});

// Webhookエンドポイント
app.post("/webhook", middleware(config), async (req: Request, res: Response) => {
  try {
    console.log("🔍 Webhook received:", JSON.stringify(req.body, null, 2));

    const event = req.body.events[0];
    const messages: any[] = [];

    // ユーザーがボットにメッセージを送った場合
    if (event.type === "message") {
      const userId = event.source.userId;

      const userMessage: string = event.message.text;
      if (userMessage == "食事を記録する") {
        await setUserMode(userId, RECORD_MODE);
        messages.push(
        {
          type: "textV2",
          text: "何を食べましたか？\n 複数ある場合は1つずつ入力してください。",
        },
        {
          type: "sticker",
          packageId: "789",
          stickerId: "10855"
        }
      )
      } else if (userMessage == "履歴検索する") {
        await setUserMode(userId, SEARCH_MODE);

        messages.push({
          type: "textV2",
          text: "食べ物の名前は何ですか？{chicken}{pizza}{ramen}\n 複数ある場合は1つずつ入力してください。",
          substitution: {
            "chicken": {
              type: "emoji",
              productId: "5ac1de17040ab15980c9b438",
              emojiId: "004"
            },
            "pizza": {
              type: "emoji",
              productId: "5ac1de17040ab15980c9b438",
              emojiId: "007"
            },
            "ramen": {
              type: "emoji",
              productId: "5ac1de17040ab15980c9b438",
              emojiId: "019"
            }
          }
        })
      } else {
        // 食事記録および履歴検索処理
        const mode = await getUserMode(userId);
        if (mode === RECORD_MODE) {
          const now = new Date();
          await createMealRecord(userMessage, now, userId);

          messages.push(
            {
              type: "textV2",
              text: "食事記録を保存しました{rice}",
              substitution: {
                "rice": {
                  type: "emoji",
                  productId: "5ac1de17040ab15980c9b438",
                  emojiId: "023"
                }
              }
            },
            {
              type: "sticker",
              packageId: "6136",
              stickerId: "10551378"
            }
          )
          console.log("🔍 食事の記録が完了しました");
        } else if (mode === SEARCH_MODE) {
          console.log(`🔍 userid: ${userId}`);

          // どれくらい前に食事をしたかを計算して応答
          const dayOrTime = await getElapsedTimeSinceLastMeal(userMessage, userId);
          const replyMessage = dayOrTime === null
            ? `${userMessage}は登録されていません💦`
            : `あなたが${userMessage}を食べたのは\n${dayOrTime}です💡`

          messages.push({
            type: "text",
            text: replyMessage,
          })
          console.log("🔍 食事の履歴検索が完了しました");
        } else {
          console.log("🔍 意味のないテキストが入力されました");
          res.sendStatus(200);
        }
      }

      // 応答メッセージを送信
      await sendReplyApi({
          replyToken: event.replyToken,
          messages
      });

      res.sendStatus(200);
    }

  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.sendStatus(500);
  }
});


export default app;
