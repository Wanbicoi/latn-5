DROP FUNCTION IF EXISTS public_v2.tags_create (TEXT, TEXT);

CREATE OR REPLACE FUNCTION public_v2.project_tags_create (color TEXT, name TEXT) RETURNS BIGINT AS $$
DECLARE
    new_tag_id BIGINT;
BEGIN
    -- Try to insert the tag, or return existing id if name already exists
    INSERT INTO public_v2._project_tags (color, name)
    VALUES (project_tags_create.color, project_tags_create.name)
    RETURNING id INTO new_tag_id;

    RETURN new_tag_id;
END;
$$ LANGUAGE plpgsql VOLATILE;