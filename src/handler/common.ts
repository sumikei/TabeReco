import { Response } from "express";
import { WebhookEvent } from "@line/bot-sdk";


const handleEvents = async (
  events: WebhookEvent[],
  res: Response,
  handleEvent: (event: WebhookEvent) => Promise<any>
) => {
  try {
    console.log(res)
    await Promise.all(events.map(handleEvent));
    res.sendStatus(200);
  } catch (err) {
    console.error("Error handling events:", err);
    res.sendStatus(500);
  }
};

export default handleEvents;
