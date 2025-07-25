\section{Workflow Engine: Data Schema and Automated Orchestration}

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
\end{itemize}

\subsection{Backend Automation: Virtual Users and Cron-Based Orchestration}
A key architectural feature of the platform's backend is its ability to automate workflow progression without direct human intervention. This is achieved through a combination of "virtual users" and scheduled cron jobs, which together form an automated orchestration layer within the SQL-based workflow engine.

\subsubsection{The Concept of Virtual Users}
To handle automated, non-human tasks, the system utilizes the concept of "virtual users." These are special user accounts within the \texttt{\_users} table, identifiable by the \texttt{is\_system} boolean field being set to \texttt{true}. These users do not represent actual people but rather system-level actors responsible for specific automated functions. Key virtual users include:
\begin{itemize}
    \item \textbf{START}: Represents the initiation point of a workflow.
    \item \textbf{ROUTER}: Handles conditional logic, automatically directing tasks to different workflow branches.
    \item \textbf{CONSENSUS}: Manages the aggregation and comparison of multiple annotations to determine agreement or disagreement.
\end{itemize}
When a task reaches a stage that requires automated processing, it is assigned to one of these virtual users in the \texttt{\_task\_assignments} table.

\subsubsection{Cron Jobs: The Automation Trigger}
Unlike human-driven tasks, which are initiated by user actions, tasks assigned to virtual users are processed by scheduled cron jobs. These jobs are PostgreSQL functions executed at regular intervals, creating a polling mechanism that processes pending automated tasks. The platform's primary cron jobs for workflow automation include \texttt{workflow\_start}, \texttt{workflow\_route}, and \texttt{workflow\_consensus}.

\subsubsection{The Automated Orchestration Flow}
The automated workflow operates as a clear, stateful sequence recorded across the database tables.
\begin{enumerate}
    \item \textbf{Assignment to Virtual User}: A task progresses to an automated stage (e.g., a \texttt{ROUTER} stage defined in \texttt{\_workflow\_stages}). A new row is inserted into \texttt{\_task\_assignments}, linking the task to the stage and the virtual user.
    \item \textbf{Scheduled Execution}: A cron job, scheduled to run periodically, executes the relevant SQL function (e.g., \texttt{workflow\_route()}).
    \item \textbf{Task Processing}: The function queries the \texttt{\_task\_assignments} table for all tasks that have a status of \texttt{PENDING} and are assigned to its corresponding virtual user.
    \item \textbf{Logic Execution}: For each pending task, the function executes its specialized logic. For a \texttt{ROUTER} stage, this involves reading the \texttt{custom\_config} JSONB field from the associated \texttt{\_workflow\_stages} entry to find its rules.
    \item \textbf{Workflow Progression}: After the logic is executed, the function transitions the task to the next stage. This is achieved by:
    \begin{enumerate}
        \item Updating the status of the current task assignment in \texttt{\_task\_assignments} to \texttt{COMPLETED}.
        \item Determining the next stage by querying the \texttt{\_workflow\_stage\_connections} table. It uses the current \texttt{stage\_id} as the \texttt{source} and the outcome of the logic (e.g., 'on\_success') as the \texttt{source\_handle} to find the \texttt{target} stage ID.
        \item Creating a new \texttt{\_task\_assignments} record for the next stage, assigning it to the appropriate human or virtual users. The \texttt{previous\_task\_assignment\_id} is set to the ID of the assignment that was just completed, creating an immutable, auditable chain of events.
    \end{enumerate}
\end{enumerate}
This cron-based approach creates a powerful, asynchronous, and fully automated backend engine that drives the workflow forward without requiring a traditional, always-on server application, further solidifying the platform's serverless architecture.