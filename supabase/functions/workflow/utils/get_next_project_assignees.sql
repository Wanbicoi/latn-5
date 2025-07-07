DROP FUNCTION IF EXISTS public_v2.get_next_project_assignees (UUID, TEXT, INT);

-- Returns the assignee UUID with the least number of tasks for the given project and stage type,
-- and who has the correct permission for the stage type ('REVIEW' or 'ANNOTATE').
CREATE OR REPLACE FUNCTION public_v2.get_next_project_assignees (
    v_project_id UUID,
    v_stage_type TEXT,
    v_limit INT DEFAULT 1 -- maximum number of assignees to return
) RETURNS UUID[] AS $$
DECLARE
    v_last_two_id UUID;
    v_last_two_type TEXT;
    v_last_two_assigned UUID;
    v_prev_two_id UUID;
    v_prev_two_type TEXT;
    v_prev_two_assigned UUID;
    v_stage_types TEXT[] := ARRAY['REVIEW', 'ANNOTATE', 'CONSENSUS_ANNOTATE', 'CONSENSUS_REVIEW'];
    v_second_assignee UUID;
BEGIN
    -- Improved: Use constant array, check for NULL, descriptive error with hint
    IF v_stage_type IS NULL OR NOT v_stage_type = ANY (v_stage_types) THEN
        RAISE EXCEPTION 'Invalid or missing stage type: %', v_stage_type
            USING HINT = 'Allowed values: REVIEW, ANNOTATE, CONSENSUS_ANNOTATE, CONSENSUS_REVIEW';
    END IF;

    IF v_limit <= 0 THEN
        RETURN ARRAY[]::UUID[];
    END IF;

    -- Get the last two assignments for this project, ordered by created_at descending
    SELECT ta.id, ws.type, ta.assigned_to
    INTO v_last_two_id, v_last_two_type, v_last_two_assigned
    FROM public_v2._task_assignments ta
    JOIN public_v2._tasks t ON t.id = ta.task_id
    JOIN public_v2._workflow_stages ws ON ws.id = ta.stage_id
    WHERE t.project_id = v_project_id
    ORDER BY ta.created_at DESC
    LIMIT 1;

    SELECT ta.id, ws.type, ta.assigned_to
    INTO v_prev_two_id, v_prev_two_type, v_prev_two_assigned
    FROM public_v2._task_assignments ta
    JOIN public_v2._tasks t ON t.id = ta.task_id
    JOIN public_v2._workflow_stages ws ON ws.id = ta.stage_id
    WHERE t.project_id = v_project_id
    ORDER BY ta.created_at DESC
    OFFSET 1
    LIMIT 1;

    IF v_last_two_type IS NOT NULL AND v_prev_two_type IS NOT NULL THEN
        IF v_last_two_type = ANY(v_stage_types) AND v_prev_two_type = ANY(v_stage_types) THEN
            IF v_prev_two_assigned IS NOT NULL THEN
                RETURN ARRAY[v_prev_two_assigned];
            END IF;
        END IF;
    END IF;

    RETURN (SELECT array_agg(user_id) FROM (
        SELECT pm.user_id
        FROM public_v2._project_members pm
        JOIN public_v2._roles r ON r.id = pm.role_id
        JOIN public_v2._role_resources rr ON rr.role_id = r.id
        JOIN public_v2._resources res ON res.id = rr.resource_id
        LEFT JOIN (
            SELECT assigned_to, COUNT(*) AS assignment_count
            FROM public_v2._task_assignments ta2
            JOIN public_v2._tasks t ON t.id = ta2.task_id
            WHERE t.project_id = v_project_id
            GROUP BY assigned_to
        ) ta_count ON ta_count.assigned_to = pm.user_id
        WHERE pm.project_id = v_project_id
          AND res.resource = 'workflow'
          AND res.action =
            CASE
                WHEN v_stage_type = 'CONSENSUS_ANNOTATE' THEN 'annotate'
                WHEN v_stage_type = 'CONSENSUS_REVIEW' THEN 'review'
                ELSE lower(v_stage_type)
            END -- 'review' or 'annotate' or consensus types mapped as above
        ORDER BY COALESCE(ta_count.assignment_count, 0) ASC
        LIMIT v_limit
    ) as sub);
END;
$$ LANGUAGE plpgsql VOLATILE;