# Backend Automation: Virtual Users and Cron-Based Workflow Orchestration

A key architectural feature of the platform's backend is its ability to automate workflow progression without direct human intervention. This is achieved through a combination of "virtual users" and scheduled cron jobs, which together form an automated orchestration layer within the SQL-based workflow engine. This approach allows for complex, multi-step processes to be executed reliably and asynchronously.

## 1. The Concept of Virtual Users

To handle automated, non-human tasks, the system utilizes the concept of "virtual users." These are special user accounts within the `_users` table, identifiable by the `is_system` boolean field being set to `true`. These users do not represent actual people but rather system-level actors responsible for specific automated functions.

Key virtual users include:
*   **START**: Represents the initiation point of a workflow.
*   **ROUTER**: Handles conditional logic, automatically directing tasks to different workflow branches based on predefined rules stored within a workflow stage's configuration.
*   **CONSENSUS**: Manages the aggregation and comparison of multiple annotations to determine agreement or disagreement, a critical step in quality control workflows.

When a task reaches a stage that requires automated processing, it is assigned to one of these virtual users. This is recorded in the `_task_assignments` table, where the `assigned_to` column holds the UUID of the corresponding virtual user.

### Example:
Imagine a workflow where two separate annotators must review an image. After both have submitted their work, a consensus check is required.

1.  The workflow engine identifies that the two prerequisite annotation tasks are complete.
2.  It advances the primary task to a "Consensus" stage.
3.  A new record is created in the `_task_assignments` table. The `task_id` points to the primary task, the `stage_id` points to the "Consensus" stage, and the `assigned_to` field is populated with the UUID of the `CONSENSUS` virtual user.

The task now waits for the automated system to process it.

## 2. Cron Jobs: The Automation Trigger

Unlike human-driven tasks that are initiated by user actions in the frontend, the tasks assigned to virtual users are processed by scheduled cron jobs. These jobs are PostgreSQL functions that are configured to execute at regular intervals (e.g., every minute), effectively creating a polling mechanism that checks for and processes pending automated tasks.

The platform's primary cron jobs for workflow automation include:

*   `workflow_start`: Initiates new tasks in a workflow.
*   `workflow_route`: Executes the logic for `ROUTER` stages.
*   `workflow_consensus`: Processes tasks at `CONSENSUS` stages.
*   `workflow_consensus_holding`: Manages tasks that are waiting for multiple inputs before a consensus calculation can be run.

## 3. The Automated Orchestration Flow

The automated workflow operates as a clear, stateful sequence recorded across the database tables.

1.  **Assignment to Virtual User**: A task progresses to an automated stage (e.g., a `ROUTER` stage defined in `_workflow_stages`). A new row is inserted into `_task_assignments`, linking the task to the stage and the virtual user.

2.  **Scheduled Execution**: A cron job, scheduled to run periodically, executes the relevant SQL function (e.g., `workflow_route()`).

3.  **Task Processing**: The function queries the `_task_assignments` table for all tasks that have a status of 'PENDING' and are assigned to its corresponding virtual user (e.g., the `ROUTER` user).

4.  **Logic Execution**: For each pending task, the function executes its specialized logic. For a `ROUTER` stage, this involves reading the `custom_config` JSONB field from the associated `_workflow_stages` entry. This configuration contains the rules needed to decide which path the workflow should take next.

5.  **Workflow Progression**: After the logic is executed, the function transitions the task to the next stage. This is achieved by:
    a.  Updating the status of the current task assignment in `_task_assignments` to 'COMPLETED'.
    b.  Determining the next stage ID by referencing the `on_success_stage_id` or `on_failure_stage_id` columns in the current `_workflow_stages` entry.
    c.  Creating a new `_task_assignments` record for the next stage, assigning it to the appropriate human or virtual users. The `previous_task_assignment_id` is set to the ID of the assignment that was just completed, creating an immutable, auditable chain of events.

This cron-based approach creates a powerful, asynchronous, and fully automated backend engine that drives the workflow forward without requiring a traditional, always-on server application, further solidifying the platform's serverless architecture.