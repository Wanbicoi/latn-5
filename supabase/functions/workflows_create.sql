CREATE OR REPLACE FUNCTION public_v2.workflows_create (project_id UUID, nodes JSONB, edges JSONB) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    node_obj RECORD;
    stage_id_var UUID;
    start_stage_id UUID;
    p_workflow_id UUID;
BEGIN
    INSERT INTO public_v2._workflows (project_id, graph_data)
    VALUES (workflows_create.project_id, jsonb_build_object('nodes', nodes, 'edges', edges))
    RETURNING id INTO p_workflow_id;

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
        IF (node_obj.node->>'type')::public_v2.stage_type IS NOT NULL THEN
            INSERT INTO public_v2._workflow_stages (workflow_id, "name", "type")
            VALUES (
                p_workflow_id,
                node_obj.node->'data'->>'label',
                (node_obj.node->>'type')::text::public_v2.stage_type
            )
            RETURNING id INTO stage_id_var;

            IF node_obj.node->>'type' = 'START' THEN
                start_stage_id := stage_id_var;
            END IF;

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

    -- Insert placeholder assignments for each new task
    INSERT INTO public_v2._task_assignments (task_id, stage_id, assigned_to)
    SELECT t.id, start_stage_id, '7780000c-1a0c-4c92-9c85-3f8a9668ab00' -- is_system user
    FROM public_v2._tasks t
    WHERE t.project_id = workflows_create.project_id;
END;
$$;
