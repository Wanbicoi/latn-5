DROP VIEW IF EXISTS public_v2.permissions;

CREATE OR REPLACE VIEW public_v2.permissions
WITH
    (security_invoker = true) AS
SELECT
    r.resource,
    r.action,
    rl.id AS role_id,
    rl.name AS role_name
FROM
    public_v2.roles rl
    JOIN public_v2._role_resources rr ON rr.role_id = rl.id
    JOIN public_v2._resources r ON rr.resource_id = r.id
ORDER BY
    r.resource,
    r.action;