--
-- Roles and Permissions Schema
--
-- 1. Roles Table in tables.sql file
-- Stores the distinct roles available in the system.
-- 2. Features Table
-- Stores the granular permissions that can be controlled.
CREATE TABLE IF NOT EXISTS public_v2._resources (
    id UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    resource VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (resource, action)
);

-- 3. Role-Features Join Table
-- Maps features to roles.
CREATE TABLE IF NOT EXISTS public_v2._role_resources (
    role_id UUID NOT NULL REFERENCES public_v2._roles (id) ON DELETE CASCADE,
    resource_id UUID NOT NULL REFERENCES public_v2._resources (id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, resource_id)
);

--
-- Seed Data
--
-- Seed Roles
INSERT INTO
    public_v2._roles (name)
VALUES
    ('admin'),
    ('reviewer'),
    ('annotator');

-- Seed Features
INSERT INTO
    public_v2._resources (resource, action)
VALUES
    ('annotation', 'annotate'),
    ('annotation', 'review'),
    ('task', 'submit'),
    ('project', 'create'),
    ('project', 'edit'),
    ('project', 'delete'),
    ('project', 'view'),
    ('project', 'manage_members'),
    ('workflow', 'create'),
    ('workflow', 'edit'),
    ('workflow', 'delete'),
    ('admin', 'access_dashboard');

-- Assign Features to Roles
-- Admin
INSERT INTO
    public_v2._role_resources (role_id, resource_id)
SELECT
    (
        SELECT
            id
        FROM
            public_v2._roles
        WHERE
            name = 'admin'
    ),
    f.id
FROM
    public_v2._resources f;

-- Reviewer
INSERT INTO
    public_v2._role_resources (role_id, resource_id)
SELECT
    (
        SELECT
            id
        FROM
            public_v2._roles
        WHERE
            name = 'reviewer'
    ),
    id
FROM
    public_v2._resources
WHERE
    (
        resource = 'task'
        AND action = 'submit'
    )
    OR (
        resource = 'project'
        AND action = 'view'
    )
    OR (
        resource = 'annotation'
        AND action = 'review'
    );

-- Annotator
INSERT INTO
    public_v2._role_resources (role_id, resource_id)
SELECT
    (
        SELECT
            id
        FROM
            public_v2._roles
        WHERE
            name = 'annotator'
    ),
    id
FROM
    public_v2._resources
WHERE
    (
        resource = 'task'
        AND action = 'submit'
    )
    OR (
        resource = 'project'
        AND action = 'view'
    )
    OR (
        resource = 'annotation'
        AND action = 'annotate'
    );
