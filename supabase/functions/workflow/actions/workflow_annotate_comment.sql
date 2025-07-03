DROP FUNCTION IF EXISTS public_v2.workflow_annotate_comment (UUID, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION public_v2.workflow_annotate_comment (
    task_assignment_id UUID,
    comment TEXT,
    series_instance_uid TEXT DEFAULT NULL,
    data JSONB DEFAULT '{}'
) RETURNS void AS $$
DECLARE
    v_project_id UUID;
BEGIN
    -- Check if the user has permission to comment
    IF NOT public_v2.check_workflow_permission(task_assignment_id, 'workflow', 'comment') 
    THEN
        RAISE EXCEPTION 'You do not have permission to comment on this task assignment';
    END IF;

    -- Find the project_id for this task_assignment
    SELECT t.project_id INTO v_project_id
    FROM public_v2._task_assignments ta
    JOIN public_v2._tasks t ON ta.task_id = t.id
    WHERE ta.id = task_assignment_id;

    -- Insert the comment into the _annotation_comments table with series_instance_uid
    INSERT INTO public_v2._annotation_comments (task_assignment_id, author_id, comment, series_instance_uid, data)
    VALUES (task_assignment_id, auth.uid(), comment, series_instance_uid, data);

    -- Check if the user has access to resource=workflow and action=review for this project
    IF public_v2.check_workflow_permission(task_assignment_id, 'workflow', 'review') THEN
        PERFORM public_v2.proceed_workflow(task_assignment_id, false);
    END IF;
END;
$$ LANGUAGE plpgsql;