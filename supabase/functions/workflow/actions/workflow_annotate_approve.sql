DROP FUNCTION IF EXISTS public_v2.workflow_annotate_approve (UUID);

CREATE OR REPLACE FUNCTION public_v2.workflow_annotate_approve (task_assignment_id UUID, segmentation_id TEXT) RETURNS void AS $$
DECLARE
    v_task_id UUID;
BEGIN
    -- Check if the user has permission to approve
    IF NOT public_v2.check_workflow_permission(task_assignment_id, 'workflow', 'review') THEN
        RAISE EXCEPTION 'You do not have permission to approve this task assignment';
    END IF;

    -- Get the task_id from the assignment
    SELECT task_id INTO v_task_id FROM public_v2._task_assignments WHERE id = task_assignment_id;

    -- Update segmentation_ids array, ensuring the correct segmentation_id is approved
    UPDATE public_v2._tasks
    SET segmentation_ids = (
        SELECT jsonb_agg(elem)
        FROM (
            SELECT 
                CASE 
                    WHEN elem->>'segmentation_id' = segmentation_id THEN jsonb_set(elem, '{is_approved}', 'true'::jsonb)
                    ELSE elem
                END AS elem
            FROM jsonb_array_elements(segmentation_ids) AS t(elem)
        ) sub
    )
    WHERE id = v_task_id;

    PERFORM public_v2.proceed_workflow(task_assignment_id, 'approve');
END;
$$ LANGUAGE plpgsql;