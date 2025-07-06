DROP VIEW IF EXISTS public_v2.task_assignment_roles;

CREATE OR REPLACE VIEW public_v2.task_assignment_roles
WITH
    (security_invoker = true) AS
SELECT
    ta.id AS task_assignment_id,
    u.id AS user_id,
    u.full_name,
    u.email,
    u.avatar_url,
    r.name AS role_name
FROM
    public_v2._task_assignments ta
    JOIN public_v2._tasks t ON ta.task_id = t.id
    JOIN public_v2._project_members pm ON t.project_id = pm.project_id
    JOIN public_v2._roles r ON pm.role_id = r.id
    JOIN public_v2._users u ON pm.user_id = u.id;