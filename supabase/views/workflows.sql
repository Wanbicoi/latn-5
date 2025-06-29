DROP VIEW IF EXISTS public_v2.workflows;

CREATE OR REPLACE VIEW public_v2.workflows
WITH
    (security_invoker = true) AS
SELECT
    *
FROM
    public_v2._workflows;