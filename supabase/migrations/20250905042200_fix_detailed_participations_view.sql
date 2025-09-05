/*
# [Fix Detailed Participations View]
This operation drops and recreates the `detailed_participations` view to resolve a column renaming error during migration and to fix a critical security issue. The view is recreated with `SECURITY INVOKER` to ensure Row-Level Security policies are correctly applied for the user querying the view.

## Query Description:
This script first removes the existing `detailed_participations` view to avoid conflicts. It then rebuilds the view with a corrected structure and, most importantly, sets it to `SECURITY INVOKER`. This is a critical security fix that ensures the view respects the permissions of the person querying it, rather than the permissions of the view's owner. No data will be lost as this only affects a view, not a table.

## Metadata:
- Schema-Category: ["Structural", "Safe"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Drops View: `public.detailed_participations`
- Creates View: `public.detailed_participations`

## Security Implications:
- RLS Status: Correctly enforces RLS on underlying tables.
- Policy Changes: No. This fixes the view to respect existing and future RLS policies.
- Auth Requirements: Any user querying this view will have their own permissions evaluated.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. View recreation is a fast metadata operation.
*/

-- Drop the existing view to prevent column name/order conflicts.
DROP VIEW IF EXISTS public.detailed_participations;

-- Recreate the view with SECURITY INVOKER to fix the security advisory and ensure RLS is applied correctly.
CREATE VIEW public.detailed_participations
WITH (security_invoker = true)
AS
SELECT
    p.id,
    p.program_id,
    p.program_type,
    (
        CASE
            WHEN p.program_type = 'stage'::public.program_type THEN ( SELECT stage_programs.title FROM public.stage_programs WHERE stage_programs.id = p.program_id)
            WHEN p.program_type = 'nonstage'::public.program_type THEN ( SELECT nonstage_programs.title FROM public.nonstage_programs WHERE nonstage_programs.id = p.program_id)
            WHEN p.program_type = 'sports'::public.program_type THEN ( SELECT sports_programs.title FROM public.sports_programs WHERE sports_programs.id = p.program_id)
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
    public.students s ON p.student_id = s.id
LEFT JOIN
    public.teams t ON p.team_id = t.id;
