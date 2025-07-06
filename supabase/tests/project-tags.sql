begin;

select
    plan (4);

select
    tests.create_supabase_user ('user1@test.com');

-- Authenticate as test user
select
    tests.authenticate_as ('user1@test.com');

-- 1. Create a project tag and check id matches view
select
    lives_ok (
        $$
            select
                public_v2.project_tags_create ('red', 'Test Tag')
        $$,
        'project_tags_create returns correct id'
    );

-- 2. Check with view
select
    results_eq (
        'select name, color from public_v2.project_tags where name = ''Test Tag'' and color = ''red''',
        $$VALUES ( 'Test Tag', 'red')$$,
        'project_tags view returns created tag'
    );

-- 3. Update the tag and check view
do $$
declare
    tag_id bigint;
begin
    select id into tag_id from public_v2.project_tags where name = 'Test Tag' and color = 'red' order by created_at desc limit 1;
    perform public_v2.project_tags_update(tag_id, 'blue', 'Updated Tag');
end
$$;

select
    results_eq (
        'select name, color from public_v2.project_tags where name = ''Updated Tag'' and color = ''blue''',
        $$VALUES ( 'Updated Tag', 'blue')$$,
        'project_tags view returns updated tag'
    );

-- 4. Delete the tag and check view
do $$
declare
    tag_id bigint;
begin
    select id into tag_id from public_v2.project_tags where name = 'Updated Tag' and color = 'blue' order by created_at desc limit 1;
    delete from public_v2._project_tags where id = tag_id;
end
$$;

select
    results_eq (
        'select count(*) from public_v2.project_tags where name = ''Updated Tag'' and color = ''blue''',
        ARRAY[0::BIGINT],
        'project_tags view does not return deleted tag'
    );

select
    *
from
    finish ();

rollback;