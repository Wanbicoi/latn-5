CREATE OR REPLACE FUNCTION public_v2.proceed_workflow (
    p_task_assignment_id UUID,
    is_success BOOLEAN DEFAULT true
) RETURNS void AS $$
DECLARE
    v_stage_id UUID;
    v_new_stage_id UUID;
BEGIN
    -- Get the current stage_id from the task_assignment
    SELECT stage_id INTO v_stage_id
    FROM public_v2._task_assignments
    WHERE id = p_task_assignment_id;

    -- Choose the next stage based on is_success
    IF is_success THEN
        SELECT on_success_stage_id INTO v_new_stage_id
        FROM public_v2._workflow_stages
        WHERE id = v_stage_id;
    ELSE
        SELECT on_failure_stage_id INTO v_new_stage_id
        FROM public_v2._workflow_stages
        WHERE id = v_stage_id;
    END IF;

    -- Call transition_tasks with the new stage
    PERFORM public_v2.proceed_task_assignment(p_task_assignment_id, v_new_stage_id);
END;
$$ LANGUAGE plpgsql;