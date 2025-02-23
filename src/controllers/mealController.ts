import { supabase } from "../models/client";


/**
 * 食べ物が初回入力であれば登録、2回目以降の入力であれば更新する
 * @param food_name 登録する食べ物名
 * @param meal_date 食べた日付
 */
export const createMealRecord = async (food_name: string, meal_date: Date) => {
  try {
    // これまでに食べたことがあるかを検索
    const { data: existingMeal, error: fetchError } = await supabase
      .from("MealRecord")
      .select("*")
      .eq("food_name", food_name)
      .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("❌ 既存データ取得エラー:", fetchError);
        return;
      }

      if (existingMeal) {
        console.log("既に登録されています。更新処理を開始します。");
        const { error: updateError } = await supabase
          .from("MealRecord")
          .update({ meal_date })
          .eq("food_name", food_name);

        if (updateError) {
          console.error("❌ 更新エラー:", updateError);
        } else {
          console.log("✅ 更新成功");
        }
      } else {
        console.log("初回登録します。");
        const { error: insertError } = await supabase
          .from("MealRecord")
          .insert([{ food_name, meal_date }]);

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
 * 指定した食べ物をもとに過去に食べた日付を取得し、何日前かを返す
 * @param food_name 検索する食べ物名
 */
export const getDaysSinceLastMeal = async (food_name: string) => {
  const { data: lastMeal, error: fetchError } = await supabase
  .from("MealRecord")
  .select("*")
  .eq("food_name", food_name)
  .single();

  // 記録がない場合
  if (!lastMeal) {
    return null;
  }

  const lastMealDate = new Date(lastMeal.meal_date);
  const today = new Date();
  const pastDays = Math.floor((today.getTime() - lastMealDate.getTime()) / (1000 * 60 * 60 * 24));

  return pastDays;
}
