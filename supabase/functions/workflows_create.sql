CREATE OR REPLACE FUNCTION public_v2.workflows_create (project_id UUID, nodes JSONB, edges JSONB) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    node_obj RECORD;
    stage_id_var UUID;
    start_stage_id UUID;
    p_workflow_id UUID;
BEGIN
    -- Check for at least one assignee using the project_members view
    IF NOT EXISTS (
        SELECT 1 FROM public_v2.project_members WHERE id = workflows_create.project_id AND jsonb_array_length(members) > 0
    ) THEN
        RAISE EXCEPTION 'Project must have at least one assignee';
    END IF;

    -- Check for at least one dataset using the datasets view
    IF NOT EXISTS (
        SELECT 1 FROM public_v2.datasets WHERE id = workflows_create.project_id AND array_length(resources, 1) > 0
    ) THEN
        RAISE EXCEPTION 'Project must have at least one dataset';
    END IF;

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
            INSERT INTO public_v2._workflow_stages (workflow_id, "type", custom_config)
            VALUES (
                p_workflow_id,
                (node_obj.node->>'type')::text::public_v2.stage_type,
                node_obj.node->'data'
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

    RAISE WARNING 'Inserting edge connection:';
    -- Raise a warning with the edge connections being inserted
    FOR node_obj IN
            SELECT
                    t1.stage_id AS source,
                    t2.stage_id AS target,
                    e->>'sourceHandle' AS source_handle
            FROM jsonb_array_elements(edges) AS e
            JOIN tmp_stage_ids t1 ON t1.node_id = e->>'source'
            JOIN tmp_stage_ids t2 ON t2.node_id = e->>'target'
            WHERE t1.stage_id IS NOT NULL AND t2.stage_id IS NOT NULL
    LOOP
            RAISE WARNING 'source=%, target=%, source_handle=%',
                    node_obj.source, node_obj.target, node_obj.source_handle;
    END LOOP;

    -- Insert edges into _workflow_stage_connections for advanced usecases
    INSERT INTO public_v2._workflow_stage_connections (source, target, source_handle)
    SELECT
        t1.stage_id AS source,
        t2.stage_id AS target,
        e->>'sourceHandle' AS source_handle
    FROM jsonb_array_elements(edges) AS e
    JOIN tmp_stage_ids t1 ON t1.node_id = e->>'source'
    JOIN tmp_stage_ids t2 ON t2.node_id = e->>'target'
    WHERE t1.stage_id IS NOT NULL AND t2.stage_id IS NOT NULL
    ON CONFLICT (source, target) DO NOTHING;

    -- Insert parentId-based connections into _workflow_stage_connections
    -- INSERT INTO public_v2._workflow_stage_connections (source, target)
    -- SELECT
    --     t_parent.stage_id AS source,
    --     t_child.stage_id AS target
    -- FROM jsonb_array_elements(nodes) AS n_child
    -- JOIN tmp_stage_ids t_child ON t_child.node_id = n_child->>'id'
    -- JOIN tmp_stage_ids t_parent ON t_parent.node_id = n_child->>'parentId'
    -- WHERE n_child->>'parentId' IS NOT NULL AND n_child->>'parentId' <> '';

    -- Insert placeholder assignments for each new task
    INSERT INTO public_v2._task_assignments (task_id, stage_id)
    SELECT t.id, start_stage_id
    FROM public_v2._tasks t
    WHERE t.project_id = workflows_create.project_id;
END;
$$;
