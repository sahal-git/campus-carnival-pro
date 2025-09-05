import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type LeaderboardEntry = Database['public']['Views']['leaderboard']['Row'];

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("rank", { ascending: true });

  if (error) throw error;
  return data || [];
};
