DROP VIEW IF EXISTS public_v2.members;

CREATE OR REPLACE VIEW public_v2.members
WITH
    (security_invoker = true) AS
WITH
    current_user_projects AS (
        -- Find all projects the current user is a member of
        SELECT
            project_id
        FROM
            public_v2._project_members
        WHERE
            user_id = auth.uid ()
    )
    -- Select all members from those projects
SELECT DISTINCT
    ON (u.id) -- Show each user only once
    u.id,
    u.full_name,
    r.name AS role
FROM
    public_v2._users u
    JOIN public_v2._project_members pm ON u.id = pm.user_id
    JOIN public_v2._roles r ON pm.role_id = r.id
WHERE
    pm.project_id IN (
        SELECT
            project_id
        FROM
            current_user_projects
    );