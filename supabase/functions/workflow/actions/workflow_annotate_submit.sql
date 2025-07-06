DROP FUNCTION IF EXISTS public_v2.workflow_annotate_submit (UUID, TEXT);

CREATE OR REPLACE FUNCTION public_v2.workflow_annotate_submit (task_assignment_id UUID, segmentation_id TEXT) RETURNS void AS $$
DECLARE
    v_task_id UUID;
BEGIN
    -- Check if the user has permission to annotate
    IF NOT public_v2.check_workflow_permission(task_assignment_id, 'workflow', 'annotate') THEN
        RAISE EXCEPTION 'You do not have permission to annotate this task assignment';
    END IF;
    
    -- Get the task_id from the assignment
    SELECT task_id INTO v_task_id FROM public_v2._task_assignments WHERE id = task_assignment_id;

    -- Update segmentation_ids array, ensuring uniqueness
    UPDATE public_v2._tasks
    SET segmentation_ids = (
        SELECT jsonb_agg(elem)
        FROM (
            SELECT elem
            FROM jsonb_array_elements(segmentation_ids || to_jsonb(
                jsonb_build_object(
                    'user_id', auth.uid(),
                    'created_at', now(),
                    'segmentation_id', segmentation_id,
                    'is_approved', false 
                )
            )) AS t(elem)
        ) sub
    )
    WHERE id = v_task_id;

    PERFORM public_v2.proceed_workflow(task_assignment_id);
END;
$$ LANGUAGE plpgsql;