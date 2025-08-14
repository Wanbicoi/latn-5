DROP VIEW IF EXISTS public_v2.project_assignee_metrics;

CREATE OR REPLACE VIEW public_v2.project_assignee_metrics
WITH
    (security_invoker = true) AS
WITH
    assignee_stats AS (
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
            ) as avg_task_duration_seconds,
            COUNT(DISTINCT t.data_item_id) as dataset_count
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
            u.avatar_url
    ),
    project_stats AS (
        SELECT
            t.project_id,
            COUNT(ta.id) as project_total_tasks_completed,
            SUM(
                EXTRACT(
                    epoch
                    from
                        (ta.stopped_at - ta.started_at)
                )
            ) as project_total_duration_seconds,
            COUNT(DISTINCT t.data_item_id) as project_total_dataset_count,
            AVG(
                EXTRACT(
                    epoch
                    from
                        (ta.stopped_at - ta.started_at)
                )
            ) as project_avg_task_duration_seconds
        FROM
            public_v2._task_assignments ta
            JOIN public_v2._tasks t ON ta.task_id = t.id
        WHERE
            ta.stopped_at IS NOT NULL
            AND ta.assigned_to IS NOT NULL
        GROUP BY
            t.project_id
    )
SELECT
    a.*,
    -- Calculate avg time per dataset for each assignee
    CASE
        WHEN a.dataset_count > 0 THEN a.total_duration_seconds / a.dataset_count
        ELSE 0
    END as avg_dataset_duration_seconds,
    -- Project totals
    p.project_total_tasks_completed,
    p.project_total_duration_seconds,
    p.project_total_dataset_count,
    p.project_avg_task_duration_seconds,
    -- Calculate project avg time per dataset
    CASE
        WHEN p.project_total_dataset_count > 0 THEN p.project_total_duration_seconds / p.project_total_dataset_count
        ELSE 0
    END as project_avg_dataset_duration_seconds
FROM
    assignee_stats a
    JOIN project_stats p ON a.project_id = p.project_id;