DROP FUNCTION IF EXISTS public_v2.get_workflow_stage_next_assignees (UUID);

-- Returns the assignee UUID with the least number of tasks for the given stage,
-- and who has the correct permission for the stage type.
CREATE OR REPLACE FUNCTION public_v2.get_workflow_stage_next_assignees (stage_id UUID) RETURNS UUID[] AS $$
DECLARE
    v_next_assignees UUID[];
    v_project_id UUID;
    v_stage_type TEXT;
    v_custom_config JSONB;
    v_assignees_count INT;
BEGIN
    -- Fetch stage type and project id for the given stage
    SELECT ws.type, w.project_id, ws.custom_config
    INTO v_stage_type, v_project_id, v_custom_config
    FROM public_v2._workflow_stages ws
    JOIN public_v2._workflows w ON w.id = ws.workflow_id
    WHERE ws.id = stage_id
    LIMIT 1;

    IF v_project_id IS NULL OR v_stage_type IS NULL THEN
        RETURN NULL;
    END IF;

    -- Assign based on stage type
    CASE
        WHEN v_stage_type IN ('ANNOTATE', 'REVIEW', 'CONSENSUS_ANNOTATE', 'CONSENSUS_REVIEW') THEN
            v_next_assignees := public_v2.get_next_project_assignees(v_project_id, v_stage_type);
        ELSE
            v_next_assignees := NULL;
    END CASE;

    RETURN v_next_assignees;
END;
$$ LANGUAGE plpgsql VOLATILE;