CREATE OR REPLACE FUNCTION public_v2.get_workflow_stage_assignees (workflow_stage_id UUID) RETURNS TABLE (user_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT pm.user_id
    FROM public_v2._workflow_stages ws
    JOIN public_v2._workflows w ON ws.workflow_id = w.id
    JOIN public_v2._project_members pm ON pm.project_id = w.project_id
    JOIN public_v2._resources r
      ON r.resource = 'workflows'
     AND r.action = (
        CASE ws.type
            WHEN 'ANNOTATE'  THEN 'annotate'
            WHEN 'REVIEW'    THEN 'review'
            WHEN 'ROUTER'    THEN 'router'
            WHEN 'MITL'      THEN 'mitl'
            WHEN 'CONSENSUS' THEN 'consensus'
            ELSE NULL
        END
     )
    JOIN public_v2._role_resources rr ON rr.resource_id = r.id
    WHERE ws.id = workflow_stage_id
      AND pm.role_id = rr.role_id;
END;
$$ LANGUAGE plpgsql STABLE;