const BASE_URL: string = "https://api.line.me";

export const LINE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
}

export const REPLY_ENDPOINT: string = `${BASE_URL}/v2/bot/message/reply`
