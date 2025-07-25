\subsection{Workflow Data Schema}
The platform's workflow engine is powered by a set of interconnected tables that define the structure, state, and history of all tasks. The schema is designed to be flexible, allowing for complex, graph-based workflows while maintaining a clear and auditable trail of every action.

\subsubsection{\texttt{\_projects}}
This table serves as the top-level container. Each project has its own set of data, tasks, and a dedicated workflow.
\begin{itemize}
    \item \texttt{id}: The unique identifier for the project.
    \item \texttt{name}: The human-readable name of the project.
    \item \texttt{created\_by}: A foreign key to the \texttt{\_users} table, indicating who created the project.
\end{itemize}

\subsubsection{\texttt{\_users}}
This table stores information about both human and system actors.
\begin{itemize}
    \item \texttt{id}: The user's unique identifier, linked to Supabase's authentication system.
    \item \texttt{is\_system}: A crucial boolean flag. When \texttt{true}, it designates the user as a "virtual user" (e.g., ROUTER, CONSENSUS) responsible for automated tasks.
\end{itemize}

\subsubsection{\texttt{\_workflows}}
Each project has one or more workflows defined in this table. It holds the high-level definition of the workflow graph.
\begin{itemize}
    \item \texttt{id}: The unique identifier for the workflow.
    \item \texttt{project\_id}: A foreign key linking the workflow to a specific project.
    \item \texttt{graph\_data}: A JSONB field that stores the visual representation of the workflow graph, used by the frontend UI.
    \item \texttt{begin\_stage\_id}: A foreign key to \texttt{\_workflow\_stages}, marking the entry point of the workflow.
\end{itemize}

\subsubsection{\texttt{\_workflow\_stages}}
These are the individual nodes within a workflow graph. Each stage represents a specific action or state.
\begin{itemize}
    \item \texttt{id}: The unique identifier for the stage.
    \item \texttt{workflow\_id}: A foreign key linking the stage to its parent workflow.
    \item \texttt{type}: An enum defining the stage's function (e.g., \texttt{ANNOTATE}, \texttt{REVIEW}, \texttt{ROUTER}, \texttt{CONSENSUS}).
    \item \texttt{custom\_config}: A JSONB field for storing stage-specific parameters, such as the rules for a \texttt{ROUTER} or the required agreement level for a \texttt{CONSENSUS} stage.
\end{itemize}

\subsubsection{\texttt{\_workflow\_stage\_connections}}
This table defines the directed edges of the workflow graph, connecting the stages.
\begin{itemize}
    \item \texttt{source}: The UUID of the origin \texttt{\_workflow\_stages} entry.
    \item \texttt{target}: The UUID of the destination \texttt{\_workflow\_stages} entry.
    \item \texttt{source\_handle}: A text field used to identify a specific output from a source stage, which is essential for stages like \texttt{ROUTER} that can have multiple exit paths (e.g., "on\_success", "on\_failure").
\end{itemize}

\subsubsection{\texttt{\_tasks}}
This is the central entity that moves through the workflow. Each task represents a single unit of work to be completed.
\begin{itemize}
    \item \texttt{id}: The unique identifier for the task.
    \item \texttt{project\_id}: A foreign key linking the task to its parent project.
    \item \texttt{data\_item\_id}: A foreign key to the specific data item (e.g., an image) that the task is associated with.
    \item \texttt{status}: The overall status of the task (e.g., \texttt{PENDING}, \texttt{IN\_PROGRESS}, \texttt{COMPLETED}).
\end{itemize}

\subsubsection{\texttt{\_task\_assignments}}
This is the most dynamic table in the workflow system. It acts as a log, recording the assignment of a task to a specific user at a particular stage.
\begin{itemize}
    \item \texttt{id}: The unique identifier for the assignment.
    \item \texttt{task\_id}: A foreign key to the \texttt{\_tasks} table.
    \item \texttt{stage\_id}: A foreign key to the \texttt{\_workflow\_stages} table, indicating where in the workflow the assignment occurred.
    \item \texttt{assigned\_to}: A foreign key to the \texttt{\_users} table, indicating who (human or virtual user) is responsible for this assignment.
    \item \texttt{status}: The status of this specific assignment (e.g., \texttt{PENDING}, \texttt{COMPLETED}).
    \item \texttt{previous\_task\_assignment\_id}: A self-referencing foreign key that chains assignments together, creating a complete, auditable history of a task's journey through the workflow.
\end{itemize>