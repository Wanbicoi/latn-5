CREATE OR REPLACE FUNCTION public_v2.proceed_task_assignment (p_task_assignment_id UUID, p_new_stage_id UUID) RETURNS void AS $$
DECLARE
    p_task_id uuid;
BEGIN
    -- Get the task_id from the task_assignment
    SELECT task_id INTO p_task_id FROM public_v2.task_assignments WHERE id = p_task_assignment_id;

    IF p_new_stage_id IS NULL THEN
        UPDATE public_v2._tasks
        SET
            current_stage_id = NULL,
            is_complete = true,
            completed_at = NOW()
        WHERE id = p_task_assignment_id;
    ELSE
        -- change status of current task_assignment to 'COMPLETED'
        UPDATE public_v2.task_assignments
        SET status = 'COMPLETED'
        WHERE id = p_task_assignment_id; 

        INSERT INTO public_v2.task_assignments (task_id, stage_id, assigned_to, status)
        SELECT
            p_task_id,
            p_new_stage_id,
            assignee_id,
            'PENDING' -- All new assignments start as PENDING
        FROM unnest(public_v2.get_workflow_stage_assignees(p_new_stage_id)) AS assignee_id;
    END IF;
END;
$$ LANGUAGE plpgsql;