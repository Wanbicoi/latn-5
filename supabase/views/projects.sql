DROP VIEW IF EXISTS public_v2.projects;

CREATE OR REPLACE VIEW public_v2.projects
WITH
    (security_invoker = true) AS
SELECT
    id,
    name,
    description,
    created_by,
    created_at,
    updated_at
FROM
    public_v2._projects;