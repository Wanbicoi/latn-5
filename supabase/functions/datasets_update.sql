-- Create tasks for a project based on selected datasource integrations
DROP FUNCTION IF EXISTS public_v2.datasets_update (id UUID, resources UUID[]);

CREATE OR REPLACE FUNCTION public_v2.datasets_update (id UUID, resources UUID[]) RETURNS void AS $$
BEGIN
    -- Remove existing tasks for this project
    DELETE FROM public_v2._tasks WHERE project_id = datasets_update.id;

    INSERT INTO public_v2._tasks (project_id, data_item_id)
    SELECT datasets_update.id, resource_id
    FROM unnest(resources) AS resource_id
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql VOLATILE;