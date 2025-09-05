/*
# [Create Detailed Results View]
This view joins results with detailed participation information to provide a comprehensive look at each result entry.

## Query Description: [This operation creates a new database view named `detailed_results`. It combines data from the `results` table and the existing `detailed_participations` view. This is a non-destructive operation and is safe to run. It does not affect existing data but provides a new way to query it.]

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: [false]
- Reversible: [true]

## Structure Details:
- View Created: `public.detailed_results`
- Columns: `id`, `created_at`, `position`, `grade`, `points_awarded`, `participation_id`, `program_name`, `program_type`, `student_name`, `team_name`, `admission_no`

## Security Implications:
- RLS Status: [Not Applicable for View Definition]
- Policy Changes: [No]
- Auth Requirements: [None for definition]
- Note: This view will be created with `SECURITY INVOKER` to ensure that it respects the Row-Level Security policies of the underlying tables for the user querying it.

## Performance Impact:
- Indexes: [None]
- Triggers: [None]
- Estimated Impact: [Low. Performance will depend on the size of the `results` and `participations` tables and the underlying indexes on their join keys.]
*/

CREATE OR REPLACE VIEW public.detailed_results
WITH (security_invoker = true)
AS
SELECT
    r.id,
    r.created_at,
    r.position,
    r.grade,
    r.points_awarded,
    p.id as participation_id,
    p.program_name,
    p.program_type,
    p.student_name,
    p.team_name,
    p.admission_no
FROM
    public.results r
JOIN
    public.detailed_participations p ON r.participation_id = p.id;
