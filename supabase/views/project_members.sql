DROP VIEW IF EXISTS public_v2.project_members;

CREATE OR REPLACE VIEW public_v2.project_members
WITH
    (security_invoker = true) AS
SELECT
    pm.project_id AS id,
    JSONB_AGG(
        JSONB_BUILD_OBJECT('id', pm.user_id, 'role_id', pm.role_id)
    ) AS members
FROM
    public_v2._project_members pm
GROUP BY
    pm.project_id;