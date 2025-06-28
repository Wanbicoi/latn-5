import { Splitter } from "antd";
import { useOhifViewer } from "../contexts/ohif-viewer";

export function OhifViewer({ children }: { children?: React.ReactNode }) {
  const { selectedTask } = useOhifViewer();

  const viewerUrl = selectedTask
    ? `${import.meta.env.VITE_OHIFVIEWER_PREVIEW_ROUTE}?StudyInstanceUIDs=${
        selectedTask.StudyInstanceUID
      }&taskId=${selectedTask.id}`
    : null;

  return (
    <Splitter>
      <Splitter.Panel defaultSize="60%" min="450" max="70%">
        {children}
      </Splitter.Panel>
      {viewerUrl && (
        <Splitter.Panel>
          <iframe
            src={viewerUrl}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="OHIF Viewer"
          />
        </Splitter.Panel>
      )}
    </Splitter>
  );
}
