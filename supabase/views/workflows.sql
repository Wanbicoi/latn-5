DROP VIEW IF EXISTS public_v2.workflows;

CREATE OR REPLACE VIEW public_v2.workflows
WITH
    (security_invoker = true) AS
SELECT
    w.graph_data,
    w.project_id AS id,
    (
        SELECT
            COUNT(*)
        FROM
            public_v2._project_members pm
        WHERE
            pm.project_id = w.project_id
    ) AS members_count,
    (
        SELECT
            COUNT(*)
        FROM
            public_v2._tasks t
        WHERE
            t.project_id = w.project_id
    ) AS data_count
FROM
    public_v2._workflows w;