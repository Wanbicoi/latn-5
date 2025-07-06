CREATE OR REPLACE FUNCTION public_v2.proceed_task_assignment (p_task_assignment_id UUID, p_new_stage_id UUID) RETURNS void AS $$
DECLARE
    p_task_id uuid;
BEGIN
    -- Get the task_id from the task_assignment
    SELECT task_id INTO p_task_id FROM public_v2._task_assignments WHERE id = p_task_assignment_id;

    IF p_new_stage_id IS NULL THEN
        UPDATE public_v2._tasks
        SET completed_at = NOW()
        WHERE id = p_task_assignment_id;
    ELSE
        -- change status of current task_assignment to 'COMPLETED'
        IF EXISTS (
            SELECT 1 FROM public_v2._task_assignments
            WHERE id = p_task_assignment_id AND status = 'COMPLETED'
        ) THEN
            RETURN;
        END IF;
        
        UPDATE public_v2._task_assignments
        SET status = 'COMPLETED'
        WHERE id = p_task_assignment_id;

        -- Get next assignee
        DECLARE
            v_next_assignees UUID[];
        BEGIN
            v_next_assignees := public_v2.get_workflow_stage_next_assignees(p_new_stage_id);

            IF COALESCE(array_length(v_next_assignees, 1), 0) = 0 THEN
                INSERT INTO public_v2._task_assignments (task_id, stage_id, status)
                VALUES (
                    p_task_id,
                    p_new_stage_id,
                    'COMPLETED'
                );
            ELSE
                DECLARE
                    v_next_assignee UUID;
                BEGIN
                    FOREACH v_next_assignee IN ARRAY v_next_assignees
                    LOOP
                        INSERT INTO public_v2._task_assignments (task_id, stage_id, assigned_to)
                        VALUES (
                            p_task_id,
                            p_new_stage_id,
                            v_next_assignee
                        );

                        PERFORM public_v2.notifications_assignment_create(v_next_assignee, p_task_assignment_id);
                    END LOOP;
                END;
            END IF;
        END;
    END IF;
END;
$$ LANGUAGE plpgsql;