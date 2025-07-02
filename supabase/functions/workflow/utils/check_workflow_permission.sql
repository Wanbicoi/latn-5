DROP FUNCTION IF EXISTS public_v2.check_workflow_permission (UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public_v2.check_workflow_permission (
    v_task_assignment_id UUID,
    v_resource TEXT,
    v_action TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_project_id UUID;
BEGIN
    SELECT t.project_id
    INTO v_project_id    
    FROM public_v2._task_assignments ta
    JOIN public_v2._tasks t ON ta.task_id = t.id
        WHERE ta.id = v_task_assignment_id;

    RETURN EXISTS (
        SELECT 1
        FROM public_v2._project_members pm
        JOIN public_v2._role_resources rr ON pm.role_id = rr.role_id
        JOIN public_v2._resources res ON rr.resource_id = res.id
        WHERE pm.project_id = v_project_id
            AND pm.user_id = auth.uid()
            AND res.resource = v_resource
            AND res.action = v_action
    );
END;
$$ LANGUAGE plpgsql VOLATILE;