DROP FUNCTION IF EXISTS public_v2.notifications_assignment_create (UUID, UUID);

CREATE OR REPLACE FUNCTION public_v2.notifications_assignment_create (p_user_id UUID, p_task_assignment_id UUID) RETURNS void AS $$
BEGIN
    INSERT INTO public_v2._notifications (user_id, type, payload)
    VALUES (
        p_user_id,
        'ASSIGNMENT_CREATED',
        jsonb_build_object(
            'content',
            'New task assigned you to task #' || p_task_assignment_id::text,
            'task_assignment_id',
            p_task_assignment_id
        )
    );
END;
$$ LANGUAGE plpgsql VOLATILE;