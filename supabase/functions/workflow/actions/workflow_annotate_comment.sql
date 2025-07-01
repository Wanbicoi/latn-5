DROP FUNCTION IF EXISTS public_v2.workflow_annotate_comment (UUID);

CREATE OR REPLACE FUNCTION public_v2.workflow_annotate_comment (task_assignment_id UUID, comment TEXT, data JSONB) RETURNS void AS $$
BEGIN
    -- Insert the comment into the _annotation_comments table
    INSERT INTO public_v2._annotation_comments (task_assignment_id, comment, data)
    VALUES (task_assignment_id, comment, data);

    -- Check if the role of the user is 'REVIEWER' then PERFORM public_v2.proceed_workflow(task_assignment_id, false);
    -- IF EXISTS (
    --     SELECT 1 FROM public_v2._user_roles 
    --     WHERE user_id = auth.uid() AND role = 'REVIEWER'
    -- ) THEN
    --     PERFORM public_v2.proceed_workflow(task_assignment_id, false);
    -- END IF;
END;
$$ LANGUAGE plpgsql;