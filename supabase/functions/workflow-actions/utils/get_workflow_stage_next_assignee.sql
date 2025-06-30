DROP FUNCTION IF EXISTS public_v2.get_workflow_stage_next_assignee (UUID);

-- Returns the assignee UUID with the least number of tasks for the given stage.
CREATE OR REPLACE FUNCTION public_v2.get_workflow_stage_next_assignee (stage_id UUID) RETURNS UUID AS $$
DECLARE
    next_assignee UUID;
    project_id UUID;
BEGIN
    SELECT t.project_id INTO project_id
    FROM public_v2._tasks t
    WHERE id = (
        SELECT task_id FROM public_v2._task_assignments 
            WHERE public_v2._task_assignments.stage_id = get_workflow_stage_next_assignee.stage_id LIMIT 1
    );

    IF project_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT ta.assigned_to
    INTO next_assignee
    FROM public_v2._task_assignments ta
    WHERE ta.stage_id = get_workflow_stage_next_assignee.stage_id
      AND ta.project_id = get_workflow_stage_next_assignee.project_id
    GROUP BY ta.assigned_to
    ORDER BY COUNT(*) ASC, ta.assigned_to ASC
    LIMIT 1;

    IF next_assignee IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN next_assignee;
END;
$$ LANGUAGE plpgsql VOLATILE;