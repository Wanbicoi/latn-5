DROP VIEW IF EXISTS public_v2.permissions;

CREATE OR REPLACE VIEW public_v2.permissions
WITH
    (security_invoker = true) AS
SELECT
    r.resource,
    r.action,
    rl.name AS role_name
FROM
    public_v2._project_members pm
    JOIN public_v2._users u ON pm.user_id = u.id
    JOIN public_v2._roles rl ON pm.role_id = rl.id
    JOIN public_v2._role_resources rr ON rr.role_id = pm.role_id
    JOIN public_v2._resources r ON rr.resource_id = r.id
Order BY
    r.resource,
    r.action;