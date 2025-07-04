DROP FUNCTION IF EXISTS public_v2.workflow_route ();

CREATE OR REPLACE FUNCTION public_v2.workflow_route () RETURNS void AS $$
DECLARE
    v_stage_id UUID;
    v_custom_config JSONB;
    v_project_id UUID;
    v_route1 INT;
    v_route2 INT;
    v_route1_threshold INT;
    v_route1_current INT;
    v_total_tasks INT;
    v_new_custom_config JSONB;
    task_assignment RECORD;
BEGIN
    FOR task_assignment IN
        SELECT ta.id
        FROM public_v2._task_assignments ta
        JOIN public_v2._workflow_stages ws ON ta.stage_id = ws.id
        WHERE ws.type = 'ROUTER'
        AND ta.status = 'PENDING'
        ORDER BY ta.id
    LOOP
        -- Get the stage and custom_config for this assignment
        SELECT ws.id, ws.custom_config, t.project_id
        INTO v_stage_id, v_custom_config, v_project_id
        FROM public_v2._workflow_stages ws
        JOIN public_v2._task_assignments ta ON ta.stage_id = ws.id
        JOIN public_v2._tasks t ON ta.task_id = t.id
        WHERE ta.id = task_assignment.id;

        -- Extract route1 and route2 from custom_config
        v_route1 := COALESCE((v_custom_config->>'route1')::INT, 0);
        v_route2 := COALESCE((v_custom_config->>'route2')::INT, 0);

        -- If route1_threshold or route1_current not set, calculate and update them
        IF v_custom_config->>'route1_threshold' IS NULL OR v_custom_config->>'route1_current' IS NULL THEN
            SELECT COUNT(*) INTO v_total_tasks
            FROM public_v2._tasks
            WHERE project_id = v_project_id;

            IF v_route2 = 0 THEN
                v_route1_threshold := v_total_tasks;
            ELSE
                v_route1_threshold := FLOOR(v_total_tasks * v_route1::NUMERIC / v_route2::NUMERIC)::INT;
            END IF;
            v_new_custom_config := jsonb_set(v_custom_config, '{route1_threshold}', to_jsonb(v_route1_threshold), true);
            v_new_custom_config := jsonb_set(v_new_custom_config, '{route1_current}', '0', true);

            v_custom_config := v_new_custom_config;

            UPDATE public_v2._workflow_stages
            SET custom_config = v_new_custom_config
            WHERE id = v_stage_id;
        END IF;

        -- Get the current value after possible update
        v_route1_current := COALESCE((v_custom_config->>'route1_current')::INT, 0);
        v_route1_threshold := COALESCE((v_custom_config->>'route1_threshold')::INT, 0);

        IF v_route1_current < v_route1_threshold THEN
            PERFORM public_v2.proceed_workflow(task_assignment.id);
        ELSE
            PERFORM public_v2.proceed_workflow(task_assignment.id, false);
            CONTINUE;
        END IF;

        -- Increment route1_current and update custom_config
        v_new_custom_config := jsonb_set(v_custom_config, '{route1_current}', to_jsonb(v_route1_current + 1), true);

        UPDATE public_v2._workflow_stages
        SET custom_config = v_new_custom_config
        WHERE id = v_stage_id;
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

select
    cron.schedule (
        'workflow_route',
        '2 seconds',
        'SELECT public_v2.workflow_route()'
    );