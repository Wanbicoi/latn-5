DROP VIEW IF EXISTS public_v2.notifications_count;

DROP VIEW IF EXISTS public_v2.notifications;

CREATE OR REPLACE VIEW public_v2.notifications
WITH
    (security_invoker = true) AS
SELECT
    n.id,
    n.user_id,
    u.full_name AS user_name,
    n.type,
    n.payload ->> 'content' AS content,
    n.payload ->> 'ref_id' AS ref_id,
    n.viewed,
    n.created_at
FROM
    public_v2._notifications n
    LEFT JOIN public_v2._users u ON n.user_id = u.id
WHERE
    n.user_id = auth.uid ();

CREATE OR REPLACE VIEW public_v2.notifications_count
WITH
    (security_invoker = true) AS
SELECT
    COUNT(*) AS count
FROM
    public_v2.notifications
WHERE
    viewed = false;