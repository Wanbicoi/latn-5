-- Drops and recreates the workflow_start function for idempotency
DROP FUNCTION IF EXISTS public_v2.workflow_start ();

CREATE OR REPLACE FUNCTION public_v2.workflow_start () RETURNS void AS $$
DECLARE
    task_assignment RECORD;
BEGIN
    FOR task_assignment IN
        SELECT id
        FROM public_v2._task_assignments
        WHERE assigned_to = '7780000c-1a0c-4c92-9c85-3f8a9668ab00'
        ORDER BY id 
    LOOP
        PERFORM public_v2.proceed_workflow(task_assignment.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;
