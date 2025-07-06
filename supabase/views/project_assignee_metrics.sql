DROP VIEW IF EXISTS public_v2.project_assignee_metrics;

CREATE OR REPLACE VIEW public_v2.project_assignee_metrics
WITH
    (security_invoker = true) AS
SELECT
    t.project_id,
    ta.assigned_to as assignee_id,
    u.full_name as assignee_name,
    u.avatar_url as assignee_avatar_url,
    COUNT(ta.id) as total_tasks_completed,
    SUM(
        EXTRACT(
            epoch
            from
                (ta.stopped_at - ta.started_at)
        )
    ) as total_duration_seconds,
    AVG(
        EXTRACT(
            epoch
            from
                (ta.stopped_at - ta.started_at)
        )
    ) as avg_duration_seconds
FROM
    public_v2._task_assignments ta
    JOIN public_v2._tasks t ON ta.task_id = t.id
    JOIN public_v2._users u ON ta.assigned_to = u.id
WHERE
    ta.stopped_at IS NOT NULL
    AND ta.assigned_to IS NOT NULL
GROUP BY
    t.project_id,
    ta.assigned_to,
    u.full_name,
    u.avatar_url;