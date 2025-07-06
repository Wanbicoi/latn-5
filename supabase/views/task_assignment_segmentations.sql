DROP VIEW IF EXISTS public_v2.task_assignment_segmentations;

CREATE OR REPLACE VIEW public_v2.task_assignment_segmentations
WITH
    (security_invoker = true) AS
SELECT
    ta.id AS task_assignment_id,
    t.id AS task_id,
    seg.value ->> 'user_id' AS user_id,
    u.full_name AS user_full_name,
    u.email AS user_email,
    u.avatar_url AS user_avatar_url,
    (seg.value ->> 'created_at')::TIMESTAMPTZ AS created_at,
    seg.value ->> 'segmentation_id' AS segmentation_id,
    (
        (seg.value ->> 'created_at')::TIMESTAMPTZ = (
            SELECT
                MAX((s.value ->> 'created_at')::TIMESTAMPTZ)
            FROM
                JSONB_ARRAY_ELEMENTS(t.segmentation_ids) AS s (value)
            WHERE
                (s.value ->> 'user_id') = (seg.value ->> 'user_id')
        )
    ) AS is_approved
FROM
    public_v2._task_assignments ta
    JOIN public_v2._tasks t ON ta.task_id = t.id
    LEFT JOIN LATERAL JSONB_ARRAY_ELEMENTS(t.segmentation_ids) AS seg (value) ON TRUE
    LEFT JOIN public_v2._users u ON u.id = (seg.value ->> 'user_id')::UUID;
