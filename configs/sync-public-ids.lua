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
    "https://bmeemseeqpnsqgwdpcoj.supabase.co/rest/v1/_datasource_integrations",
    body,
    {
      ["Content-Type"] = "application/json",
      ["apikey"] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZWVtc2VlcXBuc3Fnd2RwY29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MjM0OTcsImV4cCI6MjA1OTM5OTQ5N30.qGfF6_6sw5K-9QzDOcwjE-XOpMb-q2D5HgxFRB8LcYA",
      ["Content-Profile"] = "public_v2",
    }
  )
end

function OnDeletedStudy(studyId)
  print(">>> OnDeletedStudy triggered: " .. studyId)

  HttpDelete(
    "https://bmeemseeqpnsqgwdpcoj.supabase.co/rest/v1/_datasource_integrations?orthanc_uuid=eq." .. studyId,
    {
      ["Content-Type"] = "application/json",
      ["apikey"] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZWVtc2VlcXBuc3Fnd2RwY29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MjM0OTcsImV4cCI6MjA1OTM5OTQ5N30.qGfF6_6sw5K-9QzDOcwjE-XOpMb-q2D5HgxFRB8LcYA",
      ["Content-Profile"] = "public_v2",
    }
    )
end