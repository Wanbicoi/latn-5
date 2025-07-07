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
    COALESCE(
        ARRAY_AGG(t.id) FILTER (
            WHERE
                t.id IS NOT NULL
        ),
        ARRAY[]::bigint[]
    ) AS tags
FROM
    public_v2._projects p
    LEFT JOIN public_v2._project_to_tags pt ON pt.project_id = p.id
    LEFT JOIN public_v2._project_tags t ON t.id = pt.tag_id
    LEFT JOIN public_v2.resource_access ra_list ON ra_list.resource = 'projects'
    AND ra_list.action = 'list'
    LEFT JOIN public_v2.projects_resource_access ra_list_joined ON ra_list_joined.resource = 'projects'
    AND ra_list_joined.action = 'list_joined'
    AND ra_list_joined.project_id = p.id
WHERE
    p.deleted_at IS NULL
    AND (
        ra_list.resource IS NOT NULL
        OR ra_list_joined.resource IS NOT NULL
    )
GROUP BY
    p.id,
    p.name,
    p.description,
    p.created_by,
    p.created_at,
    p.updated_at
ORDER BY
    p.created_at DESC;