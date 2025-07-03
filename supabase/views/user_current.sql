DROP VIEW IF EXISTS public_v2.user_current;

CREATE OR REPLACE VIEW public_v2.user_current
WITH
    (security_invoker = true) AS
SELECT
    id,
    full_name,
    avatar_url
FROM
    public_v2._users
WHERE
    id = auth.uid ();