DROP FUNCTION IF EXISTS public_v2.tasks_start (task_assignment_id UUID);

CREATE OR REPLACE FUNCTION public_v2.tasks_start (task_assignment_id UUID) RETURNS VOID AS $$
BEGIN
    UPDATE public_v2._task_assignments
    SET status = 'IN_PROGRESS'
    WHERE id = task_assignment_id;
END;
$$ LANGUAGE plpgsql VOLATILE;