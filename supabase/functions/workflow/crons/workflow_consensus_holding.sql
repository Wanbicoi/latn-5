DROP FUNCTION IF EXISTS public_v2.workflow_consensus_holding ();

CREATE OR REPLACE FUNCTION public_v2.workflow_consensus_holding () RETURNS void AS $$
DECLARE
    task_to_process RECORD;
    assignments_to_skip UUID[];
    assignment_to_proceed UUID;
BEGIN
    FOR task_to_process IN
        SELECT
            ta.task_id,
            (ws.custom_config->>'annotatorsCountRequired')::int as annotators_count_required,
            COUNT(ta.id) as pending_assignments_count,
            array_agg(ta.id) as assignment_ids
        FROM public_v2._task_assignments ta
        JOIN public_v2._workflow_stages ws ON ta.stage_id = ws.id
        WHERE ws.type = 'CONSENSUS_HOLDING'
        AND ta.status = 'PENDING'
        GROUP BY ta.task_id, ws.custom_config
    LOOP
        IF task_to_process.pending_assignments_count >= task_to_process.annotators_count_required THEN
            -- Select the first assignment to proceed
            assignment_to_proceed := task_to_process.assignment_ids[1];

            -- The rest of the assignments will be skipped
            assignments_to_skip := task_to_process.assignment_ids[2:];

            -- Proceed the selected assignment to the next stage
            PERFORM public_v2.proceed_workflow(assignment_to_proceed);

            -- Mark the other assignments as SKIPPED
            IF array_length(assignments_to_skip, 1) > 0 THEN
                UPDATE public_v2._task_assignments
                SET status = 'COMPLETED'
                WHERE id = ANY(assignments_to_skip);
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql VOLATILE;