DROP VIEW IF EXISTS public_v2.tasks;

CREATE OR REPLACE VIEW public_v2.tasks
WITH
    (security_invoker = true) AS
SELECT
    t.project_id,
    ta.id,
    ws.type AS stage,
    JSONB_BUILD_OBJECT(
        'orthanc_uuid',
        di.orthanc_uuid,
        'StudyInstanceUID',
        di.data -> 'metadata' ->> 'StudyInstanceUID',
        'PatientID',
        di.data -> 'patientInfo' -> 'MainDicomTags' ->> 'PatientID',
        'PatientName',
        di.data -> 'patientInfo' -> 'MainDicomTags' ->> 'PatientName',
        'PatientSex',
        di.data -> 'patientInfo' -> 'MainDicomTags' ->> 'PatientSex',
        'AccessionNumber',
        di.data -> 'metadata' ->> 'AccessionNumber',
        'ReferringPhysicianName',
        di.data -> 'metadata' ->> 'ReferringPhysicianName'
    ) AS file,
    ta.status,
    u.full_name AS assigned_to,
    CASE
        WHEN ta.assigned_to = auth.uid () THEN true
        ELSE false
    END as is_assigned,
    ta.created_at
FROM
    public_v2._task_assignments ta
    JOIN public_v2._tasks t ON ta.task_id = t.id
    JOIN public_v2._workflow_stages ws ON ta.stage_id = ws.id
    JOIN public_v2._users u ON ta.assigned_to = u.id
    JOIN public_v2._datasource_integrations di ON t.data_item_id = di.id
    LEFT JOIN public_v2.resource_access ra_list ON ra_list.resource = 'tasks'
    AND ra_list.action = 'list'
    LEFT JOIN public_v2.projects_resource_access ra_list_assigned ON ra_list_assigned.resource = 'tasks'
    AND ra_list_assigned.action = 'list_assigned'
    AND ra_list_assigned.project_id = t.project_id
WHERE
    ta.status != 'COMPLETED'
    AND (
        u IS NULL
        OR u.is_system = false
    )
    AND (
        ra_list.resource IS NOT NULL
        OR (
            ra_list_assigned.resource IS NOT NULL
            AND ta.assigned_to = auth.uid ()
        )
    );
