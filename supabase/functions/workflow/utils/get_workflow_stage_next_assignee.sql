DROP FUNCTION IF EXISTS public_v2.get_workflow_stage_next_assignee (UUID);

-- Returns the assignee UUID with the least number of tasks for the given stage,
-- and who has the correct permission for the stage type.
CREATE OR REPLACE FUNCTION public_v2.get_workflow_stage_next_assignee (stage_id UUID) RETURNS UUID AS $$
DECLARE
    next_assignee UUID;
    v_project_id UUID;
    stage_type TEXT;
    required_action TEXT;
BEGIN
    -- Get project_id and stage_type for the stage
    SELECT ws.type, w.project_id
    INTO stage_type, v_project_id
    FROM public_v2._workflow_stages ws
    JOIN public_v2._workflows w ON w.id = ws.workflow_id
    WHERE ws.id = stage_id
    LIMIT 1;

    IF v_project_id IS NULL OR stage_type IS NULL THEN
        RETURN NULL;
    END IF;

    -- Explicitly map stage_type to permission action
    IF stage_type = 'ANNOTATE' THEN
        required_action := 'annotate';
    ELSIF stage_type = 'REVIEW' THEN
        required_action := 'review';
    ELSIF stage_type = 'CONSENSUS' THEN
        required_action := 'consensus';
    ELSIF stage_type = 'MITL' THEN
        required_action := 'mitl';
    ELSIF stage_type = 'ROUTER' THEN
        required_action := 'router';
    ELSE
        RETURN NULL;
    END IF;

    IF stage_type in ('ANNOTATE', 'REVIEW') THEN
        -- Find eligible users with correct permission and least assignments
        SELECT pm.user_id
        INTO next_assignee
        FROM public_v2._project_members pm
        JOIN public_v2._roles r ON r.id = pm.role_id
        JOIN public_v2._role_resources rr ON rr.role_id = r.id
        JOIN public_v2._resources res ON res.id = rr.resource_id
        LEFT JOIN (
            SELECT assigned_to, COUNT(*) AS assignment_count
            FROM public_v2._task_assignments ta2
            JOIN public_v2._tasks t ON t.id = ta2.task_id
            WHERE t.project_id = v_project_id
            GROUP BY assigned_to
        ) ta_count ON ta_count.assigned_to = pm.user_id
        WHERE pm.project_id = v_project_id
            AND res.resource = 'workflow'
            AND res.action = required_action
        ORDER BY COALESCE(ta_count.assignment_count, 0) ASC
        LIMIT 1;
    ELSE 
        -- For other stage types, find the is_system user, with correct required_action
        SELECT u.id
        INTO next_assignee
        FROM public_v2._users u
        JOIN public_v2._project_members pm ON pm.user_id = u.id
        JOIN public_v2._roles r ON r.id = pm.role_id
        JOIN public_v2._role_resources rr ON rr.role_id = r.id
        JOIN public_v2._resources res ON res.id = rr.resource_id
        WHERE u.is_system = true
            AND res.resource = 'workflow'
            AND res.action = required_action 
        LIMIT 1;
    END IF;

    RETURN next_assignee;
END;
$$ LANGUAGE plpgsql VOLATILE;