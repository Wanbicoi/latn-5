DROP VIEW IF EXISTS public_v2.notifications_count;

CREATE OR REPLACE VIEW public_v2.notifications_count
WITH
    (security_invoker = true) AS
SELECT
    COUNT(*) AS count
FROM
    public_v2.notifications;