DROP FUNCTION IF EXISTS public_v2.workflow_router_route (p_task_assignment_id UUID);

CREATE OR REPLACE FUNCTION public_v2.workflow_router_route (p_task_assignment_id UUID) RETURNS void AS $$
DECLARE
    v_stage_id UUID;
    v_custom_config JSONB;
    v_route1 INT;
    v_route2 INT;
    v_route1_threshold INT;
    v_route1_current INT;
    v_total_tasks INT;
    v_new_custom_config JSONB;
BEGIN
    -- Get the stage and custom_config for this assignment
    SELECT ws.id, ws.custom_config
    INTO v_stage_id, v_custom_config
    FROM public_v2._workflow_stages ws
    JOIN public_v2._task_assignments ta ON ta.stage_id = ws.id
    WHERE ta.id = p_task_assignment_id;

    -- Extract route1 and route2 from custom_config
    v_route1 := COALESCE((v_custom_config->>'route1')::INT, 0);
    v_route2 := COALESCE((v_custom_config->>'route2')::INT, 0);

    -- Calculate total tasks for this stage
    SELECT COUNT(*) INTO v_total_tasks
    FROM public_v2._task_assignments
    WHERE stage_id = v_stage_id;

    -- If route1_threshold not set, calculate and update it
    IF (v_custom_config->>'route1_threshold') IS NULL THEN
        IF v_route2 = 0 THEN
            v_route1_threshold := 0;
        ELSE
            v_route1_threshold := CEIL(v_total_tasks * v_route1::NUMERIC / v_route2::NUMERIC)::INT;
        END IF;
        v_new_custom_config := jsonb_set(v_custom_config, '{route1_threshold}', to_jsonb(v_route1_threshold), true);
        v_new_custom_config := jsonb_set(v_new_custom_config, '{route1_current}', '0', true);

        -- Update the stage's custom_config
        UPDATE public_v2._workflow_stages
        SET custom_config = v_new_custom_config
        WHERE id = v_stage_id;

        v_custom_config := v_new_custom_config;
    END IF;

    -- Increment route1_current
    v_route1_current := COALESCE((v_custom_config->>'route1_current')::INT, 0) + 1;
    v_new_custom_config := jsonb_set(v_custom_config, '{route1_current}', to_jsonb(v_route1_current), true);

    -- Update the stage's custom_config
    UPDATE public_v2._workflow_stages
    SET custom_config = v_new_custom_config
    WHERE id = v_stage_id;

    -- Additional routing logic can be added here as needed

END;
$$ LANGUAGE plpgsql VOLATILE;