create policy "allow_all_public" on "public_v2"."_resources" as PERMISSIVE for ALL to authenticated using (true);

create policy "allow_all_public" on "public_v2"."_role_resources" as PERMISSIVE for ALL to authenticated using (true);