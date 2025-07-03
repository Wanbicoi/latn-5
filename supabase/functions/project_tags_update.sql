DROP FUNCTION IF EXISTS public_v2.project_tags_update (BIGINT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public_v2.project_tags_update (id BIGINT, color TEXT, name TEXT) RETURNS VOID AS $$
BEGIN
    UPDATE public_v2._project_tags
    SET color = project_tags_update.color,
        name = project_tags_update.name
    WHERE public_v2._project_tags.id = project_tags_update.id;
END;
$$ LANGUAGE plpgsql VOLATILE;