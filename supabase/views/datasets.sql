DROP VIEW IF EXISTS public_v2.datasets;

CREATE OR REPLACE VIEW public_v2.datasets
WITH
    (security_invoker = true) AS
SELECT
    project_id as id,
    ARRAY_AGG(data_item_id) AS resources
FROM
    public_v2._tasks
GROUP BY
    project_id;