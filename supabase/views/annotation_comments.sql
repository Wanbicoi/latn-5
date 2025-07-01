DROP VIEW IF EXISTS public_v2.annotation_comments;

CREATE OR REPLACE VIEW public_v2.annotation_comments
WITH
    (security_invoker = true) AS
SELECT
    ac.id,
    ac.task_assignment_id,
    ac.author_id,
    u.full_name AS author_name,
    u.avatar_url AS author_avatar_url,
    ac.comment,
    ac.data,
    ac.created_at
FROM
    public_v2._annotation_comments ac
    LEFT JOIN public_v2._users u ON ac.author_id = u.id;