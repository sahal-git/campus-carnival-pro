/*
# [Fix Security Definer View]
This migration script addresses a critical security advisory by changing the `detailed_participations` view from `SECURITY DEFINER` to `SECURITY INVOKER`.

## Query Description:
This operation replaces the existing `detailed_participations` view. By setting `security_invoker = true`, the view will now execute with the permissions of the user calling it, not the user who created it. This is essential for Row-Level Security (RLS) to function correctly, ensuring that users can only see the data they are permitted to access. This change does not alter or delete any underlying data.

## Metadata:
- Schema-Category: ["Structural", "Safe"]
- Impact-Level: ["Medium"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- View Affected: `public.detailed_participations`
- Property Changed: `security_invoker` set to `true`.

## Security Implications:
- RLS Status: This change is a prerequisite for effective RLS on the underlying tables (`participations`, `students`, `teams`, etc.). It closes a potential security hole where RLS policies could be bypassed.
- Policy Changes: No
- Auth Requirements: Any user querying this view will now be subject to their own RLS policies.

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible. Performance should be similar to the previous view definition.
*/

CREATE OR REPLACE VIEW public.detailed_participations
WITH (security_invoker = true) AS
SELECT
    p.id,
    p.program_id,
    p.program_type,
    (
        CASE
            WHEN p.program_type = 'stage' THEN (SELECT sp.title FROM public.stage_programs sp WHERE sp.id = p.program_id)
            WHEN p.program_type = 'nonstage' THEN (SELECT nsp.title FROM public.nonstage_programs nsp WHERE nsp.id = p.program_id)
            WHEN p.program_type = 'sports' THEN (SELECT spg.title FROM public.sports_programs spg WHERE spg.id = p.program_id)
            ELSE NULL
        END
    )::character varying AS program_name,
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
