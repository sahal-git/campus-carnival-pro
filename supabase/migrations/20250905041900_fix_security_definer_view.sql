/*
# [CRITICAL SECURITY FIX] Recreate View to Enforce User Permissions
This script drops and recreates the `detailed_participations` view to resolve a critical security vulnerability. The original view used `SECURITY DEFINER`, which bypasses Row-Level Security (RLS) policies and runs with the permissions of the view's owner, not the user querying it. This could lead to unauthorized data access.

## Query Description:
This operation first `DROPS` the existing `detailed_participations` view and then `CREATES` it again. The new view will use the default `SECURITY INVOKER` behavior, ensuring that all queries respect the RLS policies of the current user. No data will be lost as this only affects the view definition.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: false (The old insecure view is dropped)

## Structure Details:
- **Dropped:** `public.detailed_participations` (view)
- **Created:** `public.detailed_participations` (view)

## Security Implications:
- RLS Status: This change is ESSENTIAL for RLS to function correctly on this view.
- Policy Changes: No. It ensures existing policies are enforced.
- Auth Requirements: Queries will now correctly use the querying user's auth context.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. View recreation is a metadata operation.
*/

-- Drop the existing insecure view
DROP VIEW IF EXISTS public.detailed_participations;

-- Recreate the view with the correct security settings (SECURITY INVOKER is the default)
CREATE VIEW public.detailed_participations AS
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
    WHEN p.program_type = 'stage' THEN sp.title
    WHEN p.program_type = 'nonstage' THEN nsp.title
    WHEN p.program_type = 'sports' THEN sportsp.title
    ELSE NULL
  END AS program_name
FROM
  public.participations p
LEFT JOIN
  public.students s ON p.student_id = s.id
LEFT JOIN
  public.teams t ON p.team_id = t.id
LEFT JOIN
  public.stage_programs sp ON p.program_id = sp.id AND p.program_type = 'stage'
LEFT JOIN
  public.nonstage_programs nsp ON p.program_id = nsp.id AND p.program_type = 'nonstage'
LEFT JOIN
  public.sports_programs sportsp ON p.program_id = sportsp.id AND p.program_type = 'sports';
