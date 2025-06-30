-- Set stopped_at to NOW() when status is set to 'COMPLETED' on _task_assignments using WHEN clause
DROP TRIGGER IF EXISTS task_assignments_set_stopped_at ON public_v2._task_assignments;

DROP FUNCTION IF EXISTS public_v2.task_assignments_set_stopped_at ();

CREATE OR REPLACE FUNCTION public_v2.task_assignments_set_stopped_at () RETURNS TRIGGER AS $$
BEGIN
    NEW.stopped_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE TRIGGER task_assignments_set_stopped_at BEFORE
UPDATE ON public_v2._task_assignments FOR EACH ROW WHEN (
    NEW.status = 'COMPLETED'
    AND OLD.status IS DISTINCT FROM NEW.status
)
EXECUTE FUNCTION public_v2.task_assignments_set_stopped_at ();