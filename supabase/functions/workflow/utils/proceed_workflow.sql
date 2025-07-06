DROP FUNCTION IF EXISTS public_v2.proceed_workflow (UUID, TEXT);

CREATE OR REPLACE FUNCTION public_v2.proceed_workflow (
    p_task_assignment_id UUID,
    p_handle_id TEXT DEFAULT NULL
) RETURNS void AS $$
DECLARE
    v_stage_id UUID;
    v_new_stage_id UUID;
BEGIN
    -- Get the current stage_id from the task_assignment
    SELECT stage_id INTO v_stage_id
    FROM public_v2._task_assignments
    WHERE id = p_task_assignment_id;

    FOR v_new_stage_id IN
        SELECT target
        FROM public_v2._workflow_stage_connections
        WHERE source = v_stage_id
          AND (p_handle_id IS NULL OR source_handle = p_handle_id)
    LOOP
        PERFORM public_v2.proceed_task_assignment(p_task_assignment_id, v_new_stage_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;