CREATE OR REPLACE VIEW public_v2.resources
WITH
    (security_invoker = true) AS
SELECT
    id,
    orthanc_uuid,
    data ->> 'StudyInstanceUID' AS "StudyInstanceUID",
    data ->> 'PatientID' AS "PatientID",
    data ->> 'PatientName' AS "PatientName",
    data ->> 'PatientSex' AS "PatientSex",
    data ->> 'AccessionNumber' AS "AccessionNumber",
    data ->> 'ReferringPhysicianName' AS "ReferringPhysicianName",
    data
FROM
    public_v2._datasource_integrations;