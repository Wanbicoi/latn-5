DROP VIEW IF EXISTS public_v2.members;

CREATE OR REPLACE VIEW public_v2.members
WITH
    (security_invoker = true) AS
select
    u.*
FROM
    public_v2._users u
WHERE
    u.id not in (
        '8a3a1c67-c14b-4ae6-a3ac-4f54e4c0224b',
        '9cd38964-fe23-4596-aacd-c6b2de77a000'
    )