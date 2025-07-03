DROP VIEW IF EXISTS public_v2.tags;

CREATE OR REPLACE VIEW public_v2.tags
WITH
    (security_invoker = true) AS
SELECT
    id,
    color,
    name
FROM
    public_v2._project_tags;