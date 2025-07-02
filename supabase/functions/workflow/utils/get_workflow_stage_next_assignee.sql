DROP FUNCTION IF EXISTS public_v2.get_workflow_stage_next_assignee (UUID);

-- Returns the assignee UUID with the least number of tasks for the given stage,
-- and who has the correct permission for the stage type.
CREATE OR REPLACE FUNCTION public_v2.get_workflow_stage_next_assignee (stage_id UUID) RETURNS UUID AS $$
DECLARE
    v_next_assignee UUID;
    v_project_id UUID;
    v_stage_type TEXT;
BEGIN
    -- Fetch stage type and project id for the given stage
    SELECT ws.type, w.project_id
    INTO v_stage_type, v_project_id
    FROM public_v2._workflow_stages ws
    JOIN public_v2._workflows w ON w.id = ws.workflow_id
    WHERE ws.id = stage_id
    LIMIT 1;

    IF v_project_id IS NULL OR v_stage_type IS NULL THEN
        RETURN NULL;
    END IF;

    -- Assign based on stage type
    CASE
        WHEN v_stage_type IN ('ANNOTATE', 'REVIEW') THEN
            -- Find eligible user with correct permission and least assignments
            SELECT pm.user_id
            INTO v_next_assignee
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
            AND res.action = lower(v_stage_type::TEXT)
            ORDER BY COALESCE(ta_count.assignment_count, 0) ASC
            LIMIT 1;

        WHEN v_stage_type = 'SUCCESS' THEN
            -- System user for SUCCESS
            v_next_assignee := 'b366abf3-a925-4d7a-890c-0c00a7b86985';
        WHEN v_stage_type = 'ARCHIVE' THEN
            -- System user for ARCHIVE
            v_next_assignee := 'c7d7341f-536f-42d9-80ec-dea3ad2e18f5';
        WHEN v_stage_type = 'MITL' THEN
            -- System user for MITL
            v_next_assignee := '8a3a1c67-c14b-4ae6-a3ac-4f54e4c0224b';
        WHEN v_stage_type = 'ROUTER' THEN
            -- System user for ROUTER
            v_next_assignee := '9cd38964-fe23-4596-aacd-c6b2de77a000';
        ELSE
            v_next_assignee := NULL;
    END CASE;

    RETURN v_next_assignee;
END;
$$ LANGUAGE plpgsql VOLATILE;