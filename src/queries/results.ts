import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate, Database } from "@/integrations/supabase/types";

export type Result = Tables<'results'>;
export type DetailedResult = Database['public']['Views']['detailed_results']['Row'];
export type UnscoredParticipation = {
    id: string;
    display_name: string;
};

// Fetch all results with details
export const getDetailedResults = async (): Promise<DetailedResult[]> => {
    const { data, error } = await supabase
        .from("detailed_results")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
};

// Fetch participations that do not have a result yet
export const getUnscoredParticipations = async (): Promise<UnscoredParticipation[]> => {
    // Get all participation IDs that are already in the results table
    const { data: scoredIds, error: scoredIdsError } = await supabase
        .from('results')
        .select('participation_id');

    if (scoredIdsError) throw scoredIdsError;
    const scoredParticipationIds = scoredIds.map(r => r.participation_id);

    // Get all participations and filter out the scored ones
    const { data: allParticipations, error: allParticipationsError } = await supabase
        .from('detailed_participations')
        .select('id, student_name, team_name, program_name');

    if (allParticipationsError) throw allParticipationsError;

    const unscored = allParticipations
        .filter(p => !scoredParticipationIds.includes(p.id))
        .map(p => ({
            id: p.id,
            display_name: `${p.program_name} - ${p.student_name || p.team_name}`
        }));

    return unscored;
};


// Create a new result
export const createResult = async (result: TablesInsert<"results">) => {
    const { data, error } = await supabase.from("results").insert(result).select().single();
    if (error) throw error;
    return data;
};

// Update an existing result
export const updateResult = async (id: string, result: TablesUpdate<"results">) => {
    const { data, error } = await supabase.from("results").update(result).eq("id", id).select().single();
    if (error) throw error;
    return data;
};

// Delete a result
export const deleteResult = async (id: string) => {
    const { error } = await supabase.from("results").delete().eq("id", id);
    if (error) throw error;
    return id;
};
