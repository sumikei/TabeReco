import { supabase } from "../models/client";

type UserMode = "record" | "search" | null;

export const setUserMode = async (userId: string, mode: string) => {
  await supabase
    .from("UserState")
    .upsert([{ user_id: userId, mode }]);
};


export const getUserMode = async (userId: string): Promise<UserMode> => {
  const { data, error } = await supabase
    .from("UserState")
    .select("mode")
    .eq("user_id", userId)
    .single();
    if (error) {
      console.log(error)
    }
  return data?.mode as UserMode ?? null;
};
