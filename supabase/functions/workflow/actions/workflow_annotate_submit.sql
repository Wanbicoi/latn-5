DROP FUNCTION IF EXISTS public_v2.workflow_annotate_submit (UUID);

CREATE OR REPLACE FUNCTION public_v2.workflow_annotate_submit (p_task_assignment_id UUID) RETURNS void AS $$
BEGIN
    -- TODO: Implement annotation submit logic here

    PERFORM public_v2.proceed_workflow(p_task_assignment_id);
END;
$$ LANGUAGE plpgsql;