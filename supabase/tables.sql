-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
CREATE TABLE public_v2._datasource_integrations (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    orthanc_uuid TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT _datasource_integrations_pkey PRIMARY KEY (id)
);

CREATE TABLE public_v2._models (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    name CHARACTER VARYING NOT NULL,
    description TEXT,
    api_endpoint TEXT NOT NULL,
    created_by UUID NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT _models_pkey PRIMARY KEY (id),
    CONSTRAINT _models_created_by_fkey FOREIGN KEY (created_by) REFERENCES public_v2._users (id)
);

CREATE TABLE public_v2._notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    user_id UUID NOT NULL,
    type USER - DEFINED NOT NULL,
    payload JSONB,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT _notifications_pkey PRIMARY KEY (id),
    CONSTRAINT _notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public_v2._users (id)
);

CREATE TABLE public_v2._project_members (
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT _project_members_pkey PRIMARY KEY (project_id, user_id),
    CONSTRAINT _project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public_v2._users (id),
    CONSTRAINT _project_members_role_id_fkey FOREIGN KEY (role_id) REFERENCES public_v2._roles (id),
    CONSTRAINT _project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public_v2._projects (id)
);

CREATE TABLE public_v2._project_tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT _project_tags_pkey PRIMARY KEY (id)
);

CREATE TABLE public_v2._project_to_tags (
    project_id UUID NOT NULL,
    tag_id BIGINT NOT NULL,
    CONSTRAINT _project_to_tags_pkey PRIMARY KEY (project_id, tag_id),
    CONSTRAINT _project_to_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public_v2._project_tags (id),
    CONSTRAINT _project_to_tags_project_id_fkey FOREIGN KEY (project_id) REFERENCES public_v2._projects (id)
);

CREATE TABLE public_v2._projects (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    name CHARACTER VARYING NOT NULL,
    description TEXT,
    created_by UUID NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
    deleted_at timestamp with time zone,
    CONSTRAINT _projects_pkey PRIMARY KEY (id),
    CONSTRAINT _projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public_v2._users (id)
);

CREATE TABLE public_v2._resources (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    resource CHARACTER VARYING NOT NULL,
    action CHARACTER VARYING NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT _resources_pkey PRIMARY KEY (id)
);

CREATE TABLE public_v2._role_resources (
    role_id UUID NOT NULL,
    resource_id UUID NOT NULL,
    CONSTRAINT _role_resources_pkey PRIMARY KEY (role_id, resource_id),
    CONSTRAINT _role_resources_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public_v2._resources (id),
    CONSTRAINT _role_resources_role_id_fkey FOREIGN KEY (role_id) REFERENCES public_v2._roles (id)
);

CREATE TABLE public_v2._roles (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT _roles_pkey PRIMARY KEY (id)
);

CREATE TABLE public_v2._task_assignments (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    task_id UUID NOT NULL,
    stage_id UUID NOT NULL,
    assigned_to UUID NOT NULL,
    status USER - DEFINED NOT NULL DEFAULT 'PENDING'::public_v2.assignment_status,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    started_at timestamp with time zone NOT NULL DEFAULT NOW(),
    stopped_at timestamp with time zone,
    CONSTRAINT _task_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT _task_assignments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public_v2._tasks (id),
    CONSTRAINT _task_assignments_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public_v2._workflow_stages (id),
    CONSTRAINT _task_assignments_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public_v2._users (id)
);

CREATE TABLE public_v2._tasks (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    data_item_id UUID NOT NULL,
    project_id UUID NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT _tasks_pkey PRIMARY KEY (id),
    CONSTRAINT _tasks_data_item_id_fkey FOREIGN KEY (data_item_id) REFERENCES public_v2._datasource_integrations (id),
    CONSTRAINT _tasks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public_v2._projects (id)
);

CREATE TABLE public_v2._users (
    id UUID NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
    CONSTRAINT _users_pkey PRIMARY KEY (id),
    CONSTRAINT _users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id)
);

CREATE TABLE public_v2._workflow_stages (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    workflow_id UUID,
    name CHARACTER VARYING NOT NULL,
    description TEXT,
    type USER - DEFINED NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::JSONB,
    on_success_stage_id UUID,
    on_failure_stage_id UUID,
    CONSTRAINT _workflow_stages_pkey PRIMARY KEY (id),
    CONSTRAINT _workflow_stages_on_success_stage_id_fkey FOREIGN KEY (on_success_stage_id) REFERENCES public_v2._workflow_stages (id),
    CONSTRAINT _workflow_stages_on_failure_stage_id_fkey FOREIGN KEY (on_failure_stage_id) REFERENCES public_v2._workflow_stages (id),
    CONSTRAINT _workflow_stages_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public_v2._workflows (id)
);

CREATE TABLE public_v2._workflows (
    id UUID NOT NULL DEFAULT GEN_RANDOM_UUID(),
    name CHARACTER VARYING NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    updated_at timestamp with time zone NOT NULL DEFAULT NOW(),
    project_id UUID,
    graph_data JSONB NOT NULL DEFAULT '{"edges": [], "nodes": [{"id": "44419dbe-79f4-4722-a314-31633f73b415", "data": {"label": "START"}, "type": "START", "width": 180, "height": 89, "dragging": false, "position": {"x": 2, "y": 42}, "selected": false, "positionAbsolute": {"x": 2, "y": 42}}, {"id": "68faa5f5-c8ba-4ee1-9b8c-514870322dd6", "data": {"label": "SUCCESS"}, "type": "SUCCESS", "width": 160, "height": 93, "dragging": false, "position": {"x": 237, "y": 74}, "selected": false, "positionAbsolute": {"x": 237, "y": 74}}]}'::JSONB,
    begin_stage_id UUID,
    CONSTRAINT _workflows_pkey PRIMARY KEY (id),
    CONSTRAINT _workflows_created_by_fkey FOREIGN KEY (created_by) REFERENCES public_v2._users (id),
    CONSTRAINT _workflows_begin_stage_id_fkey FOREIGN KEY (begin_stage_id) REFERENCES public_v2._workflow_stages (id),
    CONSTRAINT _workflows_project_id_fkey FOREIGN KEY (project_id) REFERENCES public_v2._projects (id)
);