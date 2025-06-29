CREATE OR REPLACE VIEW public_v2.resources
WITH
    (security_invoker = true) AS
SELECT
    id,
    orthanc_uuid,
    data -> 'metadata' ->> 'StudyInstanceUID' AS "StudyInstanceUID",
    data -> 'patientInfo' -> 'MainDicomTags' ->> 'PatientID' AS "PatientID",
    data -> 'patientInfo' -> 'MainDicomTags' ->> 'PatientName' AS "PatientName",
    data -> 'patientInfo' -> 'MainDicomTags' ->> 'PatientSex' AS "PatientSex",
    data -> 'metadata' ->> 'AccessionNumber' AS "AccessionNumber",
    data -> 'metadata' ->> 'ReferringPhysicianName' AS "ReferringPhysicianName",
    data
FROM
    public_v2._datasource_integrations;