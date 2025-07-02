DROP VIEW IF EXISTS public_v2.results;

CREATE OR REPLACE VIEW public_v2.results
WITH
    (security_invoker = true) AS
SELECT
    t.project_id,
    t.id AS id,
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
    COALESCE(
        JSONB_AGG(
            JSONB_BUILD_OBJECT(
                'status',
                ta.status,
                'stage',
                ws.type,
                'assigned_to',
                u.full_name,
                'created_at',
                ta.created_at
            )
            ORDER BY
                ta.created_at DESC
        ) FILTER (
            WHERE
                ta.id IS NOT NULL
        ),
        '[]'::JSONB
    ) AS details,
    -- Latest stage type for the most recent task assignment
    (
        SELECT
            ws2.type
        FROM
            public_v2._task_assignments ta2
            JOIN public_v2._workflow_stages ws2 ON ta2.stage_id = ws2.id
        WHERE
            ta2.task_id = t.id
        ORDER BY
            ta2.created_at DESC
        LIMIT
            1
    ) AS latest_stage_type,
    -- Latest status for the most recent task assignment
    (
        SELECT
            ta2.status
        FROM
            public_v2._task_assignments ta2
        WHERE
            ta2.task_id = t.id
        ORDER BY
            ta2.created_at DESC
        LIMIT
            1
    ) AS latest_status,
    MAX(ta.created_at) AS completed_at
FROM
    public_v2._tasks t
    JOIN public_v2._task_assignments ta ON ta.task_id = t.id
    JOIN public_v2._workflow_stages ws ON ta.stage_id = ws.id
    LEFT JOIN public_v2._users u ON ta.assigned_to = u.id
    JOIN public_v2._datasource_integrations di ON t.data_item_id = di.id
GROUP BY
    t.id,
    di.orthanc_uuid,
    di.data
HAVING
    BOOL_AND(ta.status = 'COMPLETED');
