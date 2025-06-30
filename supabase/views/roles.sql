DROP VIEW IF EXISTS public_v2.roles;

CREATE OR REPLACE VIEW public_v2.roles
WITH
    (security_invoker = true) AS
SELECT
    id,
    name,
    description
FROM
    public_v2._roles;