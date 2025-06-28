-- Create or replace the projects_create function
CREATE OR REPLACE FUNCTION public_v2.projects_create (name TEXT, description TEXT, tags BIGINT[]) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_project_id UUID;
  tag_id BIGINT;
BEGIN
  -- Insert a new project
  INSERT INTO public_v2._projects (name, description, created_by)
  VALUES (name, description, auth.uid())
  RETURNING id INTO new_project_id;

  -- Insert an associated empty workflow
  INSERT INTO public_v2._workflows (name, description, created_by, project_id)
  VALUES ('Default Workflow', NULL, auth.uid(), new_project_id);

  -- Associate tags with the new project
  IF array_length(tags, 1) > 0 THEN
    FOREACH tag_id IN ARRAY tags
    LOOP
      INSERT INTO public_v2._project_to_tags (project_id, tag_id)
      VALUES (new_project_id, tag_id);
    END LOOP;
  END IF;

  RETURN new_project_id;
END;
$$;