/*
# [Fix Security Definer View]
This migration script addresses a critical security vulnerability by dropping and recreating the `detailed_participations` view. The original view used `SECURITY DEFINER`, which could bypass Row-Level Security (RLS) policies, potentially exposing sensitive data. This script replaces it with a `SECURITY INVOKER` view, ensuring that all queries respect the permissions of the user making the request. This also resolves the previous migration error related to altering view columns.

## Query Description: [This operation drops the existing `detailed_participations` view and recreates it with a secure configuration (`SECURITY INVOKER`). No data will be lost as views do not store data themselves. This is a necessary step to ensure the application's data security model works as intended.]

## Metadata:
- Schema-Category: ["Structural", "Safe"]
- Impact-Level: ["High"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- View Dropped: `public.detailed_participations`
- View Created: `public.detailed_participations` (with `SECURITY INVOKER`)

## Security Implications:
- RLS Status: [Correctly Enforced]
- Policy Changes: [No policy changes, but this ensures existing and future policies are not bypassed by the view.]
- Auth Requirements: [Queries against this view will now correctly use the calling user's authentication context.]

## Performance Impact:
- Indexes: [N/A]
- Triggers: [N/A]
- Estimated Impact: [Negligible performance impact. The primary change is to the security context of queries.]
*/

-- Step 1: Drop the existing view to allow for recreation with a new structure and security model.
DROP VIEW IF EXISTS public.detailed_participations;

-- Step 2: Recreate the view with SECURITY INVOKER to ensure RLS policies are respected.
CREATE VIEW public.detailed_participations
WITH (security_invoker = true) AS
SELECT
    p.id,
    p.program_id,
    p.program_type,
    (
        CASE
            WHEN p.program_type = 'stage'::public.program_type THEN (SELECT sp.title FROM public.stage_programs sp WHERE sp.id = p.program_id)
            WHEN p.program_type = 'nonstage'::public.program_type THEN (SELECT nsp.title FROM public.nonstage_programs nsp WHERE nsp.id = p.program_id)
            WHEN p.program_type = 'sports'::public.program_type THEN (SELECT sp.title FROM public.sports_programs sp WHERE sp.id = p.program_id)
            ELSE NULL::text
        END
    ) AS program_name,
    p.student_id,
    s.name AS student_name,
    s.admission_no,
    p.team_id,
    t.name AS team_name,
    p.created_at
FROM
    public.participations p
LEFT JOIN
    public.students s ON s.id = p.student_id
LEFT JOIN
    public.teams t ON t.id = p.team_id;
