DROP FUNCTION IF EXISTS public_v2.tasks_segmentation_ids (UUID);

CREATE OR REPLACE FUNCTION public_v2.tasks_segmentation_ids (task_assignment_id UUID) RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT t.segmentation_ids
    INTO result
    FROM public_v2._task_assignments ta
    JOIN public_v2._tasks t ON ta.task_id = t.id
    WHERE ta.id = task_assignment_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;