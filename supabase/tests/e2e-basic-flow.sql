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

select
    tests.create_supabase_user ('reviewer@test.com');

select
    tests.create_supabase_user ('annotator@test.com');

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
        'New Project123123123123',
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
            ),
            JSONB_BUILD_OBJECT(
                'id',
                tests.get_supabase_uid ('reviewer@test.com'),
                'role_id',
                '849dfd16-2840-4dfd-9115-762db9ff5253' -- Reviewer role
            ),
            JSONB_BUILD_OBJECT(
                'id',
                tests.get_supabase_uid ('annotator@test.com'),
                'role_id',
                '2d0ac3ac-abd8-4611-bd86-c90ec4d7271c' -- Annotator role
            )
        )
    );

-- Test: project_members view should have one member for the project
select
    results_eq (
        $$select JSONB_ARRAY_LENGTH(members)::BIGINT from public_v2.project_members where id = ( select id from test_project )$$,
        $$SELECT 3::BIGINT$$,
        '3 members should be added to the project'
    );

-- Test: projects view returns the created project with correct name and description
select
    results_eq (
        $$select name::varchar, description::text from public_v2.projects where id = (select id from test_project)$$,
        $$VALUES ('New Project123123123123'::varchar, 'A description for the new project'::text)$$,
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
                    '[ { "id": "16d0b30a-fd0d-4b2c-a1e6-553775c9e56d", "data": {}, "type": "START", "dragging": false, "measured": { "width": 84, "height": 65 }, "position": { "x": 404.66181274095686, "y": -103.773457182454 }, "selected": true, "dragHandle": ".ant-card-head" }, { "id": "a1f53a4c-47bc-4652-870c-07a930405245", "data": {}, "type": "ANNOTATE", "dragging": false, "measured": { "width": 110, "height": 63 }, "position": { "x": 545, "y": -36.5 }, "selected": false, "dragHandle": ".ant-card-head" }, { "id": "035bfca1-9675-4908-9079-875a241ace82", "data": {}, "type": "REVIEW", "dragging": false, "measured": { "width": 96, "height": 63 }, "position": { "x": 554, "y": -192.9375 }, "selected": false, "dragHandle": ".ant-card-head" }, { "id": "ed79f5a4-dbca-44eb-af48-d0d64cc95dac", "data": {}, "type": "SUCCESS", "dragging": false, "measured": { "width": 105, "height": 63 }, "position": { "x": 776, "y": -107 }, "selected": false, "dragHandle": ".ant-card-head" } ]'::JSONB,
                    '[ { "id": "xy-edge__16d0b30a-fd0d-4b2c-a1e6-553775c9e56d-a1f53a4c-47bc-4652-870c-07a930405245", "style": { "strokeWidth": 2 }, "source": "16d0b30a-fd0d-4b2c-a1e6-553775c9e56d", "target": "a1f53a4c-47bc-4652-870c-07a930405245", "animated": true, "markerEnd": { "type": "arrowclosed" } }, { "id": "xy-edge__a1f53a4c-47bc-4652-870c-07a930405245-035bfca1-9675-4908-9079-875a241ace82", "style": { "strokeWidth": 2 }, "source": "a1f53a4c-47bc-4652-870c-07a930405245", "target": "035bfca1-9675-4908-9079-875a241ace82", "animated": true, "markerEnd": { "type": "arrowclosed" } }, { "id": "xy-edge__035bfca1-9675-4908-9079-875a241ace82reject-a1f53a4c-47bc-4652-870c-07a930405245", "style": { "strokeWidth": 2 }, "source": "035bfca1-9675-4908-9079-875a241ace82", "target": "a1f53a4c-47bc-4652-870c-07a930405245", "animated": true, "markerEnd": { "type": "arrowclosed" }, "sourceHandle": "reject" }, { "id": "xy-edge__035bfca1-9675-4908-9079-875a241ace82approve-ed79f5a4-dbca-44eb-af48-d0d64cc95dac", "style": { "strokeWidth": 2 }, "source": "035bfca1-9675-4908-9079-875a241ace82", "target": "ed79f5a4-dbca-44eb-af48-d0d64cc95dac", "animated": true, "markerEnd": { "type": "arrowclosed" }, "sourceHandle": "approve" } ]'::JSONB
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

select
    tests.authenticate_as ('annotator@test.com');

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

select
    tests.authenticate_as ('annotator@test.com');

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
        'First workflow_annotate_submit'
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
    tests.authenticate_as ('reviewer@test.com');

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
    tests.authenticate_as ('annotator@test.com');

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

select
    tests.authenticate_as ('reviewer@test.com');

-- Approve the annotation
select
    lives_ok (
        $$
            select public_v2.workflow_annotate_approve(
                (select id from test_assignment), 'uuid'
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