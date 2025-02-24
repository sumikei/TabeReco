import { supabase } from "../models/client";
import { toZonedTime } from "date-fns-tz";


/**
 * 食べ物が初回入力であれば登録、2回目以降の入力であれば更新する
 * @param foodName 登録する食べ物名
 * @param mealDate 食べた日付
 * @param userId LINEのユーザーID
 */
export const createMealRecord = async (foodName: string, mealDate: Date, userId: string) => {
  try {
    // これまでに食べたことがあるかを検索
    const { data: existingMeal, error: fetchError } = await supabase
      .from("MealRecord")
      .select("*")
      .eq("user_id", userId)
      .eq("food_name", foodName)
      .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("❌ 既存データ取得エラー:", fetchError);
        return;
      }

      if (existingMeal) {
        console.log("既に登録されています。更新処理を開始します。");

        const { error: updateError } = await supabase
          .from("MealRecord")
          .update({ "meal_date": mealDate })
          .eq("food_name", foodName);

        if (updateError) {
          console.error("❌ 更新エラー:", updateError);
        } else {
          console.log("✅ 更新成功");
        }
      } else {
        console.log("初回登録します。");
        const { error: insertError } = await supabase
          .from("MealRecord")
          .insert([{ "food_name": foodName, "meal_date": mealDate, "user_id": userId }]);

        if (insertError) {
          console.error("❌ 登録エラー:", insertError);
        } else {
          console.log("✅ 登録成功");
        }
      }

  } catch (error) {
    console.error("❌ createMealRecord error:", error);
  }
}

/**
 * 指定した食べ物をもとに過去に食べた日付を取得し、何日前or何時間前かを返す
 * 0日前の場合だけ何時間前かを返却し、
 * 1日以上の場合は何日前かを返却する
 * @param foodName 検索する食べ物名
 * @param userId LINEのユーザーID
 */
export const getElapsedTimeSinceLastMeal = async (foodName: string, userId: string): Promise<string | null> => {
  const { data: lastMeal, error: fetchError } = await supabase
  .from("MealRecord")
  .select("*")
  .eq("user_id", userId)
  .eq("food_name", foodName)
  .single();

  console.log(`🔍 検索結果: ${lastMeal}`)

  // 記録がない場合
  if (!lastMeal) {
    console.log(`error: ${fetchError}`)
    return null;
  }

  const msPerHour = 1000 * 60 * 60;
  const msPerDay = msPerHour * 24;

  // JST で `meal_date` を取得
  const lastMealDateUTC = new Date(lastMeal.meal_date);
  const lastMealDateJST = toZonedTime(lastMealDateUTC, "Asia/Tokyo");

  // JST の現在時刻を取得
  const todayJST = toZonedTime(new Date(), "Asia/Tokyo");
  const pastDays = Math.floor((todayJST.getTime() - lastMealDateJST.getTime()) / msPerDay);

  const pastTimes = Math.floor((todayJST.getTime() - lastMealDateJST.getTime()) / msPerHour);

  // 応答メッセージを判別
  const replyMsg = pastDays === 0 ? `${pastTimes}時間前` : `${pastDays}日前`;

  return replyMsg;
}
