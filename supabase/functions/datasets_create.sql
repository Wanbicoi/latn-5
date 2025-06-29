-- Create tasks for a project based on selected datasource integrations
DROP FUNCTION IF EXISTS public_v2.datasets_create (p_project_id UUID, p_resource_ids UUID[]);

CREATE OR REPLACE FUNCTION public_v2.datasets_create (p_project_id UUID, p_resource_ids UUID[]) RETURNS TABLE (task_id UUID) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO public_v2._tasks (project_id, data_item_id)
    SELECT p_project_id, resource_id
    FROM unnest(p_resource_ids) AS resource_id
    ON CONFLICT DO NOTHING
    RETURNING id AS task_id;
END;
$$ LANGUAGE plpgsql VOLATILE;