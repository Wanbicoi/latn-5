DROP FUNCTION IF EXISTS public_v2.tasks_start (task_assignment_id UUID);

CREATE OR REPLACE FUNCTION public_v2.tasks_start (task_assignment_id UUID) RETURNS VOID AS $$
BEGIN
    -- Check if assigned_to is current user
    IF NOT EXISTS (
        SELECT 1 FROM public_v2._task_assignments
        WHERE id = task_assignment_id
          AND assigned_to = auth.uid()
    ) THEN
        RAISE EXCEPTION 'You are not assigned to this task assignment';
    END IF;

    UPDATE public_v2._task_assignments
    SET status = 'IN_PROGRESS'
    WHERE id = task_assignment_id;
END;
$$ LANGUAGE plpgsql VOLATILE;