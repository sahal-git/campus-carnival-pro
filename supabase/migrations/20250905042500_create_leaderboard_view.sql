/*
          # [Operation Name]
          Create Leaderboard View

          [Description of what this operation does]
          This script creates a new database view named `leaderboard` to calculate and rank teams based on their total points. This view simplifies fetching leaderboard data for the frontend.

          ## Query Description: [This operation creates a new, non-destructive view. It reads from existing tables but does not modify any data, making it a safe operation. No backup is required.]
          
          ## Metadata:
          - Schema-Category: ["Safe"]
          - Impact-Level: ["Low"]
          - Requires-Backup: [false]
          - Reversible: [true]
          
          ## Structure Details:
          - Creates a new view: `public.leaderboard`
          
          ## Security Implications:
          - RLS Status: [Not Applicable to View]
          - Policy Changes: [No]
          - Auth Requirements: [None]
          
          ## Performance Impact:
          - Indexes: [None]
          - Triggers: [None]
          - Estimated Impact: [Low. The view performs aggregations, but should be fast on a reasonable number of results.]
          */
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  t.id AS team_id,
  t.name AS team_name,
  COALESCE(SUM(r.points_awarded), 0) AS total_points,
  RANK() OVER (ORDER BY COALESCE(SUM(r.points_awarded), 0) DESC) as rank
FROM
  public.teams t
LEFT JOIN
  public.participations p ON t.id = p.team_id
LEFT JOIN
  public.results r ON p.id = r.participation_id
GROUP BY
  t.id, t.name;
