DROP FUNCTION IF EXISTS public_v2.workflow_annotate_approve (UUID);

CREATE OR REPLACE FUNCTION public_v2.workflow_annotate_approve (task_assignment_id UUID) RETURNS void AS $$
BEGIN
    -- Check if the user has permission to approve
    IF NOT public_v2.check_workflow_permission(task_assignment_id, 'workflow', 'review') THEN
        RAISE EXCEPTION 'You do not have permission to approve this task assignment';
    END IF;

    PERFORM public_v2.proceed_workflow(task_assignment_id);
END;
$$ LANGUAGE plpgsql;