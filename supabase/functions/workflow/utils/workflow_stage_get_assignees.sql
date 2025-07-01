-- ANNOTATE
DROP FUNCTION IF EXISTS public_v2.workflow_stage_get_assignees_annotate (UUID);

CREATE OR REPLACE FUNCTION public_v2.workflow_stage_get_assignees_annotate (stage_id UUID) RETURNS TABLE (assignee UUID) AS $$
BEGIN
    -- TODO: implement logic
    RETURN;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- REVIEW
DROP FUNCTION IF EXISTS public_v2.workflow_stage_get_assignees_review (UUID);

CREATE OR REPLACE FUNCTION public_v2.workflow_stage_get_assignees_review (stage_id UUID) RETURNS TABLE (assignee UUID) AS $$
BEGIN
    -- TODO: implement logic
    RETURN;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- CONSENSUS
DROP FUNCTION IF EXISTS public_v2.workflow_stage_get_assignees_consensus (UUID);

CREATE OR REPLACE FUNCTION public_v2.workflow_stage_get_assignees_consensus (stage_id UUID) RETURNS TABLE (assignee UUID) AS $$
BEGIN
    -- TODO: implement logic
    RETURN;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- MITL
DROP FUNCTION IF EXISTS public_v2.workflow_stage_get_assignees_mitl (UUID);

CREATE OR REPLACE FUNCTION public_v2.workflow_stage_get_assignees_mitl (stage_id UUID) RETURNS TABLE (assignee UUID) AS $$
BEGIN
    -- TODO: implement logic
    RETURN;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ROUTER
DROP FUNCTION IF EXISTS public_v2.workflow_stage_get_assignees_router (UUID);

CREATE OR REPLACE FUNCTION public_v2.workflow_stage_get_assignees_router (stage_id UUID) RETURNS TABLE (assignee UUID) AS $$
BEGIN
    -- TODO: implement logic
    RETURN;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- GENERAL DISPATCH FUNCTION
DROP FUNCTION IF EXISTS public_v2.workflow_stage_get_assignees (UUID);

CREATE OR REPLACE FUNCTION public_v2.workflow_stage_get_assignees (stage_id UUID) RETURNS TABLE (assignee UUID) AS $$
DECLARE
    stage_type public_v2.stage_type;
    fn_name TEXT;
BEGIN
    SELECT type, get_assignees_uuids INTO stage_type, fn_name
    FROM public_v2._workflow_stage_functions
    WHERE type = (
        SELECT type FROM public_v2._workflow_stages WHERE id = stage_id
    );

    IF fn_name IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY EXECUTE format('SELECT assignee FROM public_v2.%I($1)', fn_name) USING stage_id;
END;
$$ LANGUAGE plpgsql VOLATILE;
