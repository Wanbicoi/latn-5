import { BaseRecord } from "@refinedev/core";
import { createContext, useContext, ReactNode, useState } from "react";

interface OhifViewerContextType {
  selectedTask: BaseRecord | null;
  setSelectedTask: (task: BaseRecord | null) => void;
}

const OhifViewerContext = createContext<OhifViewerContextType | undefined>(undefined);

export function OhifViewerProvider({ children }: { children: ReactNode }) {
  const [selectedTask, setSelectedTask] = useState<BaseRecord | null>(null);

  return (
    <OhifViewerContext.Provider value={{ selectedTask, setSelectedTask }}>
      {children}
    </OhifViewerContext.Provider>
  );
}

export function useOhifViewer() {
  const context = useContext(OhifViewerContext);
  if (context === undefined) {
    throw new Error("useOhifViewer must be used within an OhifViewerProvider");
  }
  return context;
}