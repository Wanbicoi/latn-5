DROP FUNCTION IF EXISTS public_v2.workflow_annotate_comment (UUID, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION public_v2.workflow_annotate_comment (
    task_assignment_id UUID,
    comment TEXT,
    data JSONB DEFAULT '{}'
) RETURNS void AS $$
BEGIN
    -- Check if the user has permission to comment
    IF NOT public_v2.check_workflow_permission(task_assignment_id, 'workflow', 'comment') 
    THEN
        RAISE EXCEPTION 'You do not have permission to comment on this task assignment';
    END IF;

    -- Insert the comment into the _annotation_comments table 
    INSERT INTO public_v2._annotation_comments (task_assignment_id, author_id, comment, data)
    VALUES (task_assignment_id, auth.uid(), comment, data);


    PERFORM public_v2.notifications_workflow_create(task_assignment_id);

    -- Check if the user has access to resource=workflow and action=review for this project
    IF public_v2.check_workflow_permission(task_assignment_id, 'workflow', 'review') THEN
        PERFORM public_v2.proceed_workflow(task_assignment_id, 'reject');
    END IF;
END;
$$ LANGUAGE plpgsql;