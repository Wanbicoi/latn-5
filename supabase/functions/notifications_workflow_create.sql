DROP FUNCTION IF EXISTS public_v2.notifications_workflow_create (UUID);

CREATE OR REPLACE FUNCTION public_v2.notifications_workflow_create (task_assignment_id UUID) RETURNS VOID AS $$
DECLARE
    v_task_id UUID;
    v_assign_to UUID;
    v_user_id UUID;
BEGIN
    -- Get the task_id and assigned_to for the given task_assignment_id
    SELECT task_id, assigned_to INTO v_task_id, v_assign_to
    FROM public_v2._task_assignments
    WHERE id = task_assignment_id;

    -- Insert notification for each user assigned to the same task
    FOR v_user_id IN
        SELECT assigned_to
        FROM public_v2._task_assignments
        WHERE task_id = v_task_id
            AND assigned_to != v_assign_to
            AND assigned_to IS NOT NULL
    LOOP
        INSERT INTO public_v2._notifications (user_id, type, payload)
        VALUES (
            v_user_id,
            'GENERAL',
            jsonb_build_object(
                'content',
                COALESCE(
                    (SELECT full_name FROM public_v2._users WHERE id = v_assign_to),
                    'Someone'
                ) || ' add a comment in task #' || task_assignment_id::text,
                'task_assignment_id',
                task_assignment_id
            )
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;