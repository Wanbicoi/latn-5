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
    ta.created_at
FROM
    public_v2._task_assignments ta
    JOIN public_v2._tasks t ON ta.task_id = t.id
    JOIN public_v2._workflow_stages ws ON ta.stage_id = ws.id
    JOIN public_v2._users u ON ta.assigned_to = u.id
    JOIN public_v2._datasource_integrations di ON t.data_item_id = di.id
WHERE
    ta.status != 'COMPLETED'
    AND (
        u IS NULL
        OR u.is_system = false
    );