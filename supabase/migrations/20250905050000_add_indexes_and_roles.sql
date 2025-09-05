/*
# [Operation Name]
Schema Normalization and Role Management Setup

## Query Description: [This migration introduces performance indexes on frequently queried columns and sets up a new `user_roles` table to manage application-level roles (admin, coordinator, student). This is a foundational step for implementing role-based access control (RBAC) and securing the application. No existing data is deleted, but this prepares the database for new security policies.]

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Medium"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Adds indexes to: `students`, `participations`, `results`.
- Creates new table: `public.user_roles`.
- Adds foreign key from `user_roles` to `auth.users` and `public.teams`.

## Security Implications:
- RLS Status: Enabled on the new `user_roles` table.
- Policy Changes: No, adds new policies for the `user_roles` table.
- Auth Requirements: This change is a prerequisite for application-level authentication.

## Performance Impact:
- Indexes: Added. This will improve read performance on filtered queries.
- Triggers: None.
- Estimated Impact: Positive impact on query performance for key tables.
*/

-- Step 1: Add performance indexes to existing tables
CREATE INDEX IF NOT EXISTS idx_students_team_id ON public.students (team_id);
COMMENT ON INDEX public.idx_students_team_id IS 'Improves query performance when filtering students by team.';

CREATE INDEX IF NOT EXISTS idx_participations_program_id ON public.participations (program_id, program_type);
COMMENT ON INDEX public.idx_participations_program_id IS 'Improves query performance when filtering participations by program.';

CREATE INDEX IF NOT EXISTS idx_results_participation_id ON public.results (participation_id);
COMMENT ON INDEX public.idx_results_participation_id IS 'Improves query performance when joining results with participations.';


-- Step 2: Create a table to manage user roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'coordinator', 'student')),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.user_roles IS 'Stores application-specific roles for users.';
COMMENT ON COLUMN public.user_roles.user_id IS 'Links to the authenticated user in auth.users.';
COMMENT ON COLUMN public.user_roles.role IS 'Defines the user''s role (admin, coordinator, student).';
COMMENT ON COLUMN public.user_roles.team_id IS 'Optional: Associates a coordinator with a specific team.';


-- Step 3: Enable Row Level Security (RLS) and define policies for the new user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
USING (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.user_roles WHERE user_id = auth.uid()) = 'admin'
);

CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());
