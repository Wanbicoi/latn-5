-- Allow all access to authenticated for all tables in public_v2
create
or replace policy "allow_all_public" on "public_v2"."_users" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_roles" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_projects" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_project_members" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_project_tags" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_project_to_tags" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_data_items" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_models" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_workflows" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_workflow_stages" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_tasks" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_task_assignments" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_notifications" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_datasource_integrations" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_resources" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_role_resources" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_annotation_comments" as PERMISSIVE for ALL to authenticated using (true);

CREATE POLICY list ON public_v2._task_assignments FOR
SELECT
    USING (
        EXISTS (
            SELECT
                1
            FROM
                public_v2._role_resources rr
                JOIN public_v2._resources r ON rr.resource_id = r.id
                JOIN public_v2._project_members pm ON pm.role_id = rr.id
                JOIN public_v2._tasks t ON t.project_id = pm.project_id
            WHERE
                t.id = public_v2._task_assignments.task_id
                AND pm.user_id = auth.uid ()
                AND r.resource = 'tasks'
                AND (
                    (
                        r.action = 'list_assigned'
                        AND assigned_to = auth.uid ()
                    )
                    OR r.action = 'list'
                )
        )
    );

CREATE POLICY list ON public_v2._projects FOR
SELECT
    USING (
        EXISTS (
            SELECT
                1
            FROM
                public_v2._role_resources rr
                JOIN public_v2._resources r ON rr.resource_id = r.id
                JOIN public_v2._project_members pm ON pm.role_id = rr.id
            WHERE
                r.resource = 'projects'
                AND (
                    (
                        r.action = 'list_joined'
                        AND public_v2._projects.id = pm.project_id
                        AND pm.user_id = auth.uid ()
                    )
                    OR r.action = 'list'
                )
        )
    );