DROP VIEW IF EXISTS public_v2.workflows;

CREATE OR REPLACE VIEW public_v2.workflows
WITH
    (security_invoker = true) AS
SELECT
    graph_data,
    project_id as id
FROM
    public_v2._workflows;