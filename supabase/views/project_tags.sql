DROP VIEW IF EXISTS public_v2.project_tags;

CREATE OR REPLACE VIEW public_v2.project_tags
WITH
    (security_invoker = true) AS
SELECT
    id,
    name,
    color,
    created_at
FROM
    public_v2._project_tags;