import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type DetailedParticipation = Tables<'detailed_participations'>;
export type Participation = Tables<'participations'>;

export const getDetailedParticipations = async (): Promise<DetailedParticipation[]> => {
  const { data, error } = await supabase
    .from("detailed_participations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  // The view might return multiple rows for the same program, let's use a placeholder for now
  // This is a known issue with the current view definition
  return data || [];
};

export const createParticipation = async (participation: TablesInsert<"participations">) => {
  const { data, error } = await supabase.from("participations").insert(participation).select().single();
  if (error) {
    if (error.code === '23505') { // Unique constraint violation
        throw new Error("This participant is already registered for this program.");
    }
    throw error;
  }
  return data;
};

export const deleteParticipation = async (id: string) => {
  const { error } = await supabase.from("participations").delete().eq("id", id);
  if (error) throw error;
  return id;
};
