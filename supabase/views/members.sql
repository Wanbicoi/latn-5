DROP VIEW IF EXISTS public_v2.members;

CREATE OR REPLACE VIEW public_v2.members
WITH
    (security_invoker = true) AS
select
    u.id,
    u.full_name,
    u.email
FROM
    public_v2._users u
WHERE
    u.is_system = false
