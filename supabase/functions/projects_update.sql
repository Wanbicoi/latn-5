-- Update project name, description, and tags
DROP FUNCTION IF EXISTS public_v2.projects_update (TEXT, TEXT, UUID, bigint[]);

CREATE OR REPLACE FUNCTION public_v2.projects_update (
    description TEXT,
    name TEXT,
    id UUID,
    tags BIGINT[]
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Update name and description
  UPDATE public_v2._projects
  SET name = projects_update.name,
      description = projects_update.description,
      updated_at = NOW()
  WHERE public_v2._projects.id = projects_update.id;

  -- Remove existing tags
  DELETE FROM public_v2._project_to_tags
  WHERE project_id = projects_update.id;

  -- Add new tags
  IF array_length(projects_update.tags, 1) > 0 THEN
    INSERT INTO public_v2._project_to_tags (project_id, tag_id)
    SELECT projects_update.id, unnest(projects_update.tags);
  END IF;
END;
$$;