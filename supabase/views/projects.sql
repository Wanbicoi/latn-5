DROP VIEW IF EXISTS public_v2.projects;

CREATE OR REPLACE VIEW public_v2.projects
WITH
    (security_invoker = true) AS
SELECT
    p.id,
    p.name,
    p.description,
    p.created_by,
    p.created_at,
    p.updated_at,
    w.name AS workflow_name,
    w.description AS workflow_description,
    w.is_active AS workflow_is_active,
    w.created_by AS workflow_created_by,
    w.created_at AS workflow_created_at,
    COALESCE(
        ARRAY_AGG(t.id) FILTER (
            WHERE
                t.id IS NOT NULL
        ),
        ARRAY[]::bigint[]
    ) AS tags
FROM
    public_v2._projects p
    LEFT JOIN public_v2._workflows w ON w.project_id = p.id
    LEFT JOIN public_v2._project_to_tags pt ON pt.project_id = p.id
    LEFT JOIN public_v2._project_tags t ON t.id = pt.tag_id
GROUP BY
    p.id,
    p.name,
    p.description,
    p.created_by,
    p.created_at,
    p.updated_at,
    w.name,
    w.description,
    w.is_active,
    w.created_by,
    w.created_at;