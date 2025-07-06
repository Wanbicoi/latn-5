begin;

select
    plan (3);

select
    tests.create_supabase_user ('user1@test.com');

-- Authenticate as test user
select
    tests.authenticate_as ('user1@test.com');

-- 1. Create a project and store its id in a temp table
create temp table test_project as
select
    public_v2.projects_create (
        'New Project',
        'A description for the new project',
        ARRAY[]::bigint[]
    ) as id;

select
    results_eq (
        $$select name::varchar, description::text from public_v2.projects where id = (select id from test_project)$$,
        $$VALUES ('New Project'::varchar, 'A description for the new project'::text)$$,
        'projects view returns updated project'
    );

-- 2. Update the project and check view
select
    lives_ok (
        public_v2.projects_update (
            'Updated project description',
            'Updated Project Name',
            (
                select
                    id
                from
                    test_project
            ),
            ARRAY[]::bigint[]
        ),
        'projects_update returns correct id'
    );

select
    results_eq (
        $$select name::text, description from public_v2.projects where id = (select id from test_project)$$,
        $$VALUES ('Updated Project Name'::text, 'Updated project description')$$,
        'projects view returns updated project'
    );

-- 3. Delete the project and check view
select
    public_v2.projects_delete (
        (
            select
                id
            from
                test_project
        )
    );

select
    results_eq (
        'select count(*) from public_v2.projects where id = (select id from test_project)',
        ARRAY[0::BIGINT],
        'projects view does not return deleted project'
    );

select
    *
from
    finish ();

rollback;