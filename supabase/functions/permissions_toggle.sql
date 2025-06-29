DROP FUNCTION IF EXISTS public_v2.permissions_toggle (role_id UUID, resource TEXT, action TEXT);

CREATE OR REPLACE FUNCTION public_v2.permissions_toggle (role_id UUID, resource TEXT, action TEXT) RETURNS void AS $$
DECLARE
    v_resource_id uuid;
    v_permission_id uuid;
BEGIN
    -- Find resource_id
    SELECT id INTO v_resource_id FROM public_v2._resources WHERE public_v2._resources.resource = permissions_toggle.resource;
    IF v_resource_id IS NULL THEN
        RAISE EXCEPTION 'Resource not found: %', permissions_toggle.resource;
    END IF;

    -- Toggle: if exists, delete; else, insert
    IF EXISTS (
        SELECT 1 FROM public_v2._role_resources rs
        WHERE rs.role_id = permissions_toggle.role_id AND rs.resource_id = v_resource_id
    ) THEN
        DELETE FROM public_v2._role_resources rs
        WHERE rs.role_id = permissions_toggle.role_id AND rs.resource_id = v_resource_id;
    ELSE
        INSERT INTO public_v2._role_resources(role_id, resource_id)
        VALUES (role_id, v_resource_id);
    END IF;
END;
$$ LANGUAGE plpgsql VOLATILE;