CREATE OR REPLACE FUNCTION public_v2.get_workflow_stage_assignees (workflow_stage_id UUID) RETURNS TABLE (user_id UUID) AS $$
DECLARE
    v_stage_type public.stage_type;
BEGIN
    -- Get the stage type for the given workflow
    SELECT "type" INTO v_stage_type
    FROM public_v2._workflow_stages
    WHERE id = workflow_stage_id;

    RETURN QUERY
    WITH action_map AS (
        SELECT
            CASE
                WHEN v_stage_type = 'ANNOTATE'  THEN 'annotate'
                WHEN v_stage_type = 'REVIEW' THEN 'review'
                WHEN v_stage_type = 'ROUTER' THEN 'router'
                WHEN v_stage_type = 'MITL' THEN 'mitl'
                WHEN v_stage_type = 'CONSENSUS' THEN 'consensus'
                ELSE NULL
            END AS action
    ),
    project AS (
        SELECT project_id
        FROM public_v2._workflows
        WHERE id = workflow_id
    ),
    members AS (
        SELECT user_id, role_id
        FROM public_v2._project_members
        WHERE project_id = (SELECT project_id FROM project)
    ),
    resources AS (
        SELECT id
        FROM public_v2._resources
        WHERE resource = 'workflow'
          AND action = (SELECT action FROM action_map)
    ),
    allowed_roles AS (
        SELECT role_id
        FROM public_v2._role_resources
        WHERE resource_id = (SELECT id FROM resources)
    )
    SELECT m.user_id
    FROM members m
    WHERE m.role_id IN (SELECT role_id FROM allowed_roles);
END;
$$ LANGUAGE plpgsql STABLE;