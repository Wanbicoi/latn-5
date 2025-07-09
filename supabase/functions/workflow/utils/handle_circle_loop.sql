DROP FUNCTION IF EXISTS public_v2.handle_circle_loop (UUID, UUID);

CREATE OR REPLACE FUNCTION public_v2.handle_circle_loop (p_task_id UUID, p_new_stage_id UUID) RETURNS UUID[] AS $$
DECLARE
    v_last_assignee UUID;
    v_stage_assignees UUID[];
    v_next_assignee UUID;
    v_last_assignee_index INT;
BEGIN
    -- Get the last assignee for this task at this stage
    SELECT assigned_to
    INTO v_last_assignee
    FROM public_v2._task_assignments
    WHERE task_id = p_task_id AND stage_id = p_new_stage_id AND assigned_to IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1;

    -- If there was no last assignee, it's not a loop for assignment purposes.
    IF v_last_assignee IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN ARRAY[v_last_assignee];
END;
$$ LANGUAGE plpgsql;