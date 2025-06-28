-- workflows_update.sql
-- Atomic function to update workflow nodes and edges for a given workflow_id
CREATE OR REPLACE FUNCTION public_v2.workflows_update (p_workflow_id UUID, nodes JSONB, edges JSONB) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    node_obj RECORD;
    stage_id_var UUID;
BEGIN
    -- Update graph_data column with nodes and edges
    UPDATE public_v2._workflows
    SET graph_data = jsonb_build_object('nodes', nodes, 'edges', edges)
    WHERE id = p_workflow_id;

    -- Remove existing workflow stages for this workflow
    DELETE FROM public_v2._workflow_stages WHERE workflow_id = p_workflow_id;

    -- Temporary table to map node_id to stage_id
    CREATE TEMP TABLE tmp_stage_ids (
        node_id TEXT PRIMARY KEY,
        stage_id UUID
    ) ON COMMIT DROP;

    -- Insert new workflow stages and capture mapping
    FOR node_obj IN SELECT * FROM jsonb_array_elements(nodes) AS node(node)
    LOOP
        -- Only insert if type is a valid stage_type
        IF node_obj.node->>'type' IN ('ANNOTATE', 'REVIEW', 'CONSENSUS', 'MITL', 'ROUTER', 'SUCCESS', 'ARCHIVED') THEN
            INSERT INTO public_v2._workflow_stages (workflow_id, "name", "type")
            VALUES (
                p_workflow_id,
                node_obj.node->'data'->>'label',
                (node_obj.node->>'type')::text::public.stage_type
            )
            RETURNING id INTO stage_id_var;

            -- Insert mapping only if stage was inserted
            INSERT INTO tmp_stage_ids(node_id, stage_id)
            VALUES (node_obj.node->>'id', stage_id_var);
        ELSE
            -- For other node types, insert mapping with NULL stage_id for edge processing
            INSERT INTO tmp_stage_ids(node_id, stage_id)
            VALUES (node_obj.node->>'id', NULL);
        END IF;
    END LOOP;

    -- Update on_success_stage_id and on_failure_stage_id based on edges
    -- Set on_success_stage_id for approve/null handle
    UPDATE public_v2._workflow_stages ws
    SET on_success_stage_id = sub.target_stage_id
    FROM (
        SELECT t1.stage_id, t2.stage_id AS target_stage_id
        FROM jsonb_array_elements(edges) AS e
        JOIN tmp_stage_ids t1 ON t1.node_id = e->>'source'
        JOIN tmp_stage_ids t2 ON t2.node_id = e->>'target'
        WHERE (e->>'sourceHandle') IS NULL OR (e->>'sourceHandle') = 'approve'
    ) sub
    WHERE ws.id = sub.stage_id;

    -- Set on_failure_stage_id for reject handle
    UPDATE public_v2._workflow_stages ws
    SET on_failure_stage_id = sub.target_stage_id
    FROM (
        SELECT t1.stage_id, t2.stage_id AS target_stage_id
        FROM jsonb_array_elements(edges) AS e
        JOIN tmp_stage_ids t1 ON t1.node_id = e->>'source'
        JOIN tmp_stage_ids t2 ON t2.node_id = e->>'target'
        WHERE (e->>'sourceHandle') = 'reject'
    ) sub
    WHERE ws.id = sub.stage_id;

END;
$$;
