begin;

select
    plan (19);

CREATE FUNCTION public_v2.get_next_assignment_id (task_assignment_id UUID) RETURNS UUID AS $$
DECLARE
    next_id uuid;
BEGIN
    SELECT ta.id
    INTO next_id
    FROM public_v2._task_assignments ta
    JOIN public_v2._tasks t ON ta.task_id = t.id
    WHERE t.id = (
        SELECT t.id
        FROM public_v2._tasks t
        JOIN public_v2._task_assignments ta2 ON t.id = ta2.task_id
        WHERE ta2.id = task_assignment_id
        LIMIT 1
    )
    AND ta.status = 'PENDING'
    AND ta.id <> task_assignment_id -- exclude current one
    ORDER BY ta.id
    LIMIT 1;

    RETURN next_id;
END;
$$ LANGUAGE plpgsql;

select
    tests.create_supabase_user ('admin@test.com');

-- Authenticate as test user
select
    tests.authenticate_as ('admin@test.com');

-- Create a tag and store its id in a temp table for later use
create temp table test_tag as
select
    public_v2.project_tags_create ('red', 'Test Tag') as id;

-- Test: project_tags view returns the created tag with correct name and color
select
    results_eq (
        $$select name::varchar, color::text from public_v2.project_tags where id = (select id from test_tag)$$,
        $$VALUES ('Test Tag'::varchar, 'red'::text)$$,
        'projects view returns updated project'
    );

-- Create a project and store its id in a temp table for later use
create temp table test_project as
select
    public_v2.projects_create (
        'New Project',
        'A description for the new project',
        ARRAY[
            (
                select
                    id
                from
                    test_tag
            )
        ]::bigint[]
    ) as id;

-- Test: projects view returns the created project with correct name and description
select
    results_eq (
        $$select name::varchar, description::text from public_v2.projects where id = (select id from test_project)$$,
        $$VALUES ('New Project'::varchar, 'A description for the new project'::text)$$,
        'projects view returns updated project'
    );

-- Diagnostic: Output the test project id for debugging
SELECT
    diag (
        'Inspecting test_project_id: ',
        (
            select
                id as test_project_id
            from
                test_project
        )::TEXT
    );

-- Update the project and check that the view reflects the update
select
    public_v2.projects_update (
        'Updated project description',
        'Updated Project Name',
        (
            select
                id
            from
                test_project
        ),
        ARRAY[
            (
                select
                    id
                from
                    test_tag
            )
        ]::bigint[]
    );

-- Test: projects view returns the updated project name and description
select
    results_eq (
        $$select name::text, description from public_v2.projects where id = (select id from test_project)$$,
        $$VALUES ('Updated Project Name'::text, 'Updated project description')$$,
        'projects view returns updated project'
    );

-- Add a member to the project as admin
select
    public_v2.project_members_update (
        (
            select
                id
            from
                test_project
            limit
                1
        ),
        JSONB_BUILD_ARRAY(
            JSONB_BUILD_OBJECT(
                'id',
                tests.get_supabase_uid ('admin@test.com'),
                'role_id',
                'a6be23ff-1aca-4f92-8414-aefbad438d20' -- Admin role
            )
        )
    );

-- Test: project_members view should have one member for the project
select
    results_eq (
        $$select COUNT(*)::BIGINT from public_v2.project_members where id = ( select id from test_project )$$,
        $$SELECT 1::BIGINT$$,
        'A member should be added to the project'
    );

-- Update dataset for the project using datasets_update
select
    lives_ok (
        $$
            select 
                public_v2.datasets_update ( ( select id from test_project ),
                    ARRAY(
                        select id from public_v2.resources
                    )
            )
        $$,
        'datasets_update successfully updates the dataset for the project'
    );

-- Create a workflow for the project
select
    lives_ok (
        $$
            select 
                public_v2.workflows_create ( 
                    ( select id from test_project ),
                    '[ { "id": "6462df51-ec8e-4728-97eb-16f4ab2c8654", "data": {}, "type": "START", "dragging": false, "measured": { "width": 82, "height": 63 }, "position": { "x": 371.5, "y": -28 }, "selected": false, "dragHandle": ".ant-card-head" }, { "id": "28c0e488-147f-4759-8c8d-1150c93c93ce", "data": {}, "type": "ANNOTATE", "dragging": false, "measured": { "width": 110, "height": 63 }, "position": { "x": 546, "y": 51 }, "selected": false, "dragHandle": ".ant-card-head" }, { "id": "8bd0275e-f977-45d6-8a6a-2ed05dcf61af", "data": {}, "type": "SUCCESS", "dragging": false, "measured": { "width": 105, "height": 63 }, "position": { "x": 798, "y": -42.5 }, "selected": false, "dragHandle": ".ant-card-head" }, { "id": "caa618d5-3921-4554-9021-663968c9bc6c", "data": {}, "type": "REVIEW", "dragging": false, "measured": { "width": 96, "height": 63 }, "position": { "x": 550.5, "y": -96.5625 }, "selected": false, "dragHandle": ".ant-card-head" } ]'::JSONB,
                    '[ { "id": "xy-edge__6462df51-ec8e-4728-97eb-16f4ab2c8654-28c0e488-147f-4759-8c8d-1150c93c93ce", "style": { "strokeWidth": 2 }, "source": "6462df51-ec8e-4728-97eb-16f4ab2c8654", "target": "28c0e488-147f-4759-8c8d-1150c93c93ce", "animated": true, "markerEnd": { "type": "arrowclosed" } }, { "id": "xy-edge__28c0e488-147f-4759-8c8d-1150c93c93ce-caa618d5-3921-4554-9021-663968c9bc6c", "style": { "strokeWidth": 2 }, "source": "28c0e488-147f-4759-8c8d-1150c93c93ce", "target": "caa618d5-3921-4554-9021-663968c9bc6c", "animated": true, "markerEnd": { "type": "arrowclosed" } }, { "id": "xy-edge__caa618d5-3921-4554-9021-663968c9bc6creject-28c0e488-147f-4759-8c8d-1150c93c93ce", "style": { "strokeWidth": 2 }, "source": "caa618d5-3921-4554-9021-663968c9bc6c", "target": "28c0e488-147f-4759-8c8d-1150c93c93ce", "animated": true, "markerEnd": { "type": "arrowclosed" }, "sourceHandle": "reject" }, { "id": "xy-edge__caa618d5-3921-4554-9021-663968c9bc6capprove-8bd0275e-f977-45d6-8a6a-2ed05dcf61af", "style": { "strokeWidth": 2 }, "source": "caa618d5-3921-4554-9021-663968c9bc6c", "target": "8bd0275e-f977-45d6-8a6a-2ed05dcf61af", "animated": true, "markerEnd": { "type": "arrowclosed" }, "sourceHandle": "approve" } ]'::JSONB
                )
        $$,
        'workflows_create successfully creates a workflow'
    );

-- Test: workflows view should have one workflow for the project
select
    results_eq (
        $$ select COUNT(*)::BIGINT from public_v2.workflows where id = ( select id from test_project ) $$,
        $$SELECT 1::BIGINT$$,
        'A workflow should be created'
    );

select
    results_eq (
        $$ select COUNT(*)::BIGINT from 
        public_v2._workflow_stages ws
        JOIN public_v2._workflows w ON ws.workflow_id = w.id
        where w.project_id = ( select id from test_project ) $$,
        $$SELECT 4::BIGINT$$,
        '4 workflow_stages should be created'
    );

-- Start the workflow for the project
select
    public_v2.workflow_start ();

-- Test: tasks view should have correct number of PENDING tasks for the project
select
    results_eq (
        $$
            select count(*)::BIGINT
            from public_v2.tasks
            where project_id = (select id from test_project) and status = 'PENDING'
        $$,
        $$   
            select count(*)::BIGINT
            from public_v2._tasks
            where project_id = ( select id from test_project )
        $$,
        'workflow_start created correct number of task_assignment_id for the project in tasks view'
    );

-- Store a PENDING task assignment into a temp table for later use
create temp table test_assignment as
select
    id
from
    public_v2.tasks
where
    project_id = (
        select
            id
        from
            test_project
    )
    and status = 'PENDING'
limit
    1;

-- Diagnostic: Output the test assignment id for debugging
SELECT
    diag (
        'Inspecting test_assignment: ',
        (
            select
                id
            from
                test_assignment
        )::TEXT
    );

-- Check test_assignment is not null
select
    results_ne (
        $$ select id from test_assignment $$,
        $$ VALUES (CAST(NULL AS uuid)) $$,
        'test_assignment should not be null'
    );

-- Start the task assignment using tasks_start
select
    lives_ok (
        $$
            select 
                public_v2.tasks_start (
                    ( select id from test_assignment )
                )
        $$,
        'tasks_start'
    );

select
    results_eq (
        $$ select status from public_v2.tasks where id = ( select id from test_assignment ) $$,
        $$VALUES ('IN_PROGRESS'::public_v2.assignment_status)$$,
        'tasks_start sets task assignment to IN_PROGRESS'
    );

-- The following tests for submit, comment, and approve are commented out for now
-- -- Submit the annotation for the task assignment
select
    lives_ok (
        $$
            select 
                public_v2.workflow_annotate_submit (
                    ( select id from test_assignment ),
                    'segmentationid'
                )
        $$,
        'workflow_annotate_submit successfully submits the annotation'
    );

select
    results_eq (
        $$ 
            select ta.status from public_v2._task_assignments ta
            JOIN public_v2._tasks t ON ta.task_id = t.id
            where t.id = ( 
                select distinct t.id from public_v2._tasks t
                join public_v2._task_assignments ta on t.id = ta.task_id
                where ta.id = ( select id from test_assignment )
            )
        $$,
        $$VALUES ('COMPLETED'::public_v2.assignment_status), ('COMPLETED'::public_v2.assignment_status), ('PENDING'::public_v2.assignment_status)$$,
        'workflow_annotate_submit check all task assignments for the task are COMPLETED except the one that is still PENDING'
    );

update test_assignment
set
    id = public_v2.get_next_assignment_id (
        (
            select
                id
            from
                test_assignment
        )
    );

-- Add a comment to the annotation
select
    lives_ok (
        $$
            select public_v2.workflow_annotate_comment(
                (select id from test_assignment),
                'Test comment'
            )
        $$,
        'workflow_annotate_comment successfully adds a comment'
    );

select
    results_eq (
        $$
            select comment::text from public_v2.annotation_comments
            where task_assignment_id = (select id from test_assignment)
            order by created_at desc limit 1
        $$,
        $$VALUES ('Test comment'::text)$$,
        'annotation_comments view returns the added comment'
    );

update test_assignment
set
    id = public_v2.get_next_assignment_id (
        (
            select
                id
            from
                test_assignment
        )
    );

select
    lives_ok (
        $$
            select 
                public_v2.workflow_annotate_submit (
                    ( select id from test_assignment ),
                    'segmentationid2'
                )
        $$,
        'workflow_annotate_submit successfully submits the annotation'
    );

update test_assignment
set
    id = public_v2.get_next_assignment_id (
        (
            select
                id
            from
                test_assignment
        )
    );

-- Approve the annotation
select
    lives_ok (
        $$
            select public_v2.workflow_annotate_approve(
                (select id from test_assignment)
            )
        $$,
        'workflow_annotate_approve successfully approves the annotation'
    );

select
    results_eq (
        $$ 
            select ta.status from public_v2._task_assignments ta
            JOIN public_v2._tasks t ON ta.task_id = t.id
            where t.id = ( 
                select distinct t.id from public_v2._tasks t
                join public_v2._task_assignments ta on t.id = ta.task_id
                where ta.id = ( select id from test_assignment )
            )
        $$,
        $$
            VALUES ('COMPLETED'::public_v2.assignment_status),
            ('COMPLETED'::public_v2.assignment_status),
            ('COMPLETED'::public_v2.assignment_status),
            ('COMPLETED'::public_v2.assignment_status),
            ('COMPLETED'::public_v2.assignment_status),
            ('COMPLETED'::public_v2.assignment_status)
          $$,
        'workflow_annotate_approve check all task assignments for the task are COMPLETED'
    );

-- Finish the test plan
select
    *
from
    finish ();

rollback;