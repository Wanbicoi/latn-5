-- DROP VIEW IF EXISTS public_v2.resource_access;
CREATE OR REPLACE VIEW public_v2.resource_access
WITH
    (security_invoker = true) AS
SELECT DISTINCT
    resource,
    action
FROM
    (
        SELECT
            r.resource,
            r.action
        FROM
            public_v2._project_members pm
            JOIN public_v2._roles ro ON pm.role_id = ro.id
            JOIN public_v2._role_resources rr ON ro.id = rr.role_id
            JOIN public_v2._resources r ON rr.resource_id = r.id
        WHERE
            pm.user_id = auth.uid ()
        UNION ALL
        SELECT
            r.resource,
            r.action
        FROM
            public_v2._resources r
        WHERE
            auth.jwt ()::JSON ->> 'email' = 'info@refine.dev'
            AND resource != 'workflow'
    ) all_resources;
