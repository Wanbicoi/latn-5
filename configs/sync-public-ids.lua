function OnStableStudy(studyId, tags, metadata)
  print(">>> OnStableStudy triggered: " .. studyId)
  -- Get parent (patient) information
  local patientInfo = ParseJson(RestApiGet('/studies/' .. studyId .. '/patient'))

  -- Prepare payload for _datasource_integrations (new schema)
  local body = DumpJson({
    orthanc_uuid = studyId,
    data = {
      StudyInstanceUID = tags["StudyInstanceUID"],
      metadata = tags,
      patientInfo = patientInfo
    }
  })

  HttpPost(
    "https://bmeemseeqpnsqgwdpcoj.supabase.co/rest/v1/public_v2._datasource_integrations",
    body,
    {
      ["Content-Type"] = "application/json",
      ["apikey"] = "",
    }
  )
end

function OnDeletedStudy(studyId)
  print(">>> OnDeletedStudy triggered: " .. studyId)

  HttpDelete(
    "https://bmeemseeqpnsqgwdpcoj.supabase.co/rest/v1/public_v2._datasource_integrations?uuid=eq." .. studyId,
    {
      ["Content-Type"] = "application/json",
      ["apikey"] = "",
    }
    )
end