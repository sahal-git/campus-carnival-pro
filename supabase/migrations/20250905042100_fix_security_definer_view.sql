/*
# [Fix Security Definer View]
This migration script addresses a critical security advisory by recreating the `detailed_participations` view with `SECURITY INVOKER` instead of the default `SECURITY DEFINER`.

## Query Description: [This operation drops and recreates the `detailed_participations` view. It changes the security context under which the view is executed, ensuring that Row-Level Security (RLS) policies of the user querying the view are enforced. There is no risk of data loss as it only affects a view, not underlying tables.]

## Metadata:
- Schema-Category: ["Security", "Structural"]
- Impact-Level: ["High"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- View Affected: `public.detailed_participations`

## Security Implications:
- RLS Status: [Corrected]
- Policy Changes: [No]
- Auth Requirements: [This change is a prerequisite for effective RLS based on user authentication.]
- Description: Fixes a critical vulnerability where the view would execute with the permissions of its owner, potentially bypassing RLS policies intended for the current user.

## Performance Impact:
- Indexes: [N/A]
- Triggers: [N/A]
- Estimated Impact: [Negligible performance impact. The primary change is to the security execution context.]
*/

-- Drop the existing view to be safe
DROP VIEW IF EXISTS public.detailed_participations;

-- Recreate the view with SECURITY INVOKER to enforce RLS of the calling user
CREATE VIEW public.detailed_participations
WITH (security_invoker = true) AS
SELECT
    p.id,
    p.created_at,
    p.program_id,
    p.program_type,
    p.student_id,
    s.name AS student_name,
    s.admission_no,
    p.team_id,
    t.name AS team_name,
    CASE
        WHEN p.program_type = 'stage'::public.program_type THEN sp.title
        WHEN p.program_type = 'nonstage'::public.program_type THEN nsp.title
        WHEN p.program_type = 'sports'::public.program_type THEN sportsp.title
        ELSE NULL::text
    END AS program_name
FROM
    public.participations p
LEFT JOIN
    public.students s ON p.student_id = s.id
LEFT JOIN
    public.teams t ON p.team_id = t.id
LEFT JOIN
    public.stage_programs sp ON p.program_id = sp.id AND p.program_type = 'stage'::public.program_type
LEFT JOIN
    public.nonstage_programs nsp ON p.program_id = nsp.id AND p.program_type = 'nonstage'::public.program_type
LEFT JOIN
    public.sports_programs sportsp ON p.program_id = sportsp.id AND p.program_type = 'sports'::public.program_type;
