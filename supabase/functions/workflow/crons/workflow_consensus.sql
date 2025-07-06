DROP FUNCTION IF EXISTS public_v2.workflow_consensus ();

CREATE OR REPLACE FUNCTION public_v2.workflow_consensus () RETURNS void AS $$
DECLARE
    workstage RECORD;
BEGIN
    FOR workstage IN
        SELECT ws.id
        FROM public_v2._workflow_stages ws
        JOIN public_v2._task_assignments ta ON ws.id = ta.stage_id
        WHERE ws.type = 'CONSENSUS'
        GROUP BY ws.id
    LOOP
        PERFORM public_v2.proceed_workflow(workstage.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- select
--     cron.schedule (
--         'workflow_consensus',
--         '2 seconds',
--         'SELECT public_v2.workflow_consensus()'
--     );