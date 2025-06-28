-- Allow all access to authenticated for all tables in public_v2
create policy "allow_all_public" on "public_v2"."_users" as PERMISSIVE for ALL to authenticated using (true);

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