DROP FUNCTION IF EXISTS public_v2.workflow_start ();

CREATE OR REPLACE FUNCTION public_v2.workflow_start () RETURNS void AS $$
DECLARE
    task_assignment RECORD;
BEGIN
    FOR task_assignment IN
        SELECT ta.id
        FROM public_v2._task_assignments ta
        JOIN public_v2._workflow_stages ws ON ta.stage_id = ws.id
        WHERE ws.type = 'START'
        AND ta.status = 'PENDING'
        ORDER BY ta.id 
    LOOP
        PERFORM public_v2.proceed_workflow(task_assignment.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

select
    cron.schedule (
        'workflow_start',
        '2 seconds',
        'SELECT public_v2.workflow_start()'
    );