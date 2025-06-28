1. Core Principles
This design is centered on three core principles:

Flexibility through Composition: Workflows are built by linking modular stages into a directed graph, enabling the creation of both simple and complex, logic-driven pipelines.

**Enum Conventions:**
All ENUM values in the schema use UPPER CASE, e.g.
- assignment_status: PENDING, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED
- stage_type: ANNOTATE, REVIEW, CONSENSUS, MITL, ROUTER
- notification_type: ASSIGNMENT_CREATED, STATUS_CHANGED, MENTION, TIMEOUT_WARNING

Decoupled Intelligence: The platform does not host models or complex business logic directly. It communicates with external services (like a model inference API) and contains its own logic within a Workflow Engine, which orchestrates task movement between stages.

Full Data Lineage: Every piece of data, from the initial pre-annotation to the final label, is traceable back to the specific stage, assignment, and user (or model) that created it. This is critical for quality control, auditing, and debugging.

2. Final Database Schema (PostgreSQL)
This schema is optimized for transactional integrity, storing the structure and state of all workflows and tasks.

workflows
Defines reusable workflow templates.

Column Name

Data Type

Constraints

Description

id

UUID

Primary Key

Unique identifier for the workflow template.

name

VARCHAR(255)

Not Null

A human-readable name (e.g., "Standard Review Workflow").

description

TEXT



A description of the workflow's purpose.

is_active

BOOLEAN

Not Null, Default true

Allows for archiving old workflow versions without deletion.

created_by

UUID

Foreign Key (users.id)

The user who created the template.

created_at

TIMESTAMP

Not Null

Timestamp of creation.

workflow_stages
Defines the nodes (stages) in a workflow template.

Column Name

Data Type

Constraints

Description

id

UUID

Primary Key

Unique identifier for a stage.

workflow_id

UUID

Foreign Key (workflows.id)

The workflow this stage belongs to.

name

VARCHAR(255)

Not Null

Name of the stage (e.g., "Initial Annotation").

description

TEXT



Optional description of the stage's purpose for the UI.

type

VARCHAR(50)
(stage_type: ANNOTATE, REVIEW, CONSENSUS, MITL, ROUTER)

Not Null

ANNOTATE, REVIEW, CONSENSUS, MITL, ROUTER.

config

JSONB

Not Null, Default '{}'

Stage-specific configuration (see config schemas below).

on_success_stage_id

UUID

FK (workflow_stages.id), Nullable

The next stage on a successful outcome. NULL marks a "Done" path.

on_failure_stage_id

UUID

FK (workflow_stages.id), Nullable

The stage to transition to on a failed outcome.

tasks
Represents a single data item moving through a workflow.

Column Name

Data Type

Constraints

Description

id

UUID

Primary Key

Unique identifier for an annotation task.

data_item_id

UUID

Foreign Key (data_items.id)

The data item associated with this task.

project_id

UUID

Foreign Key (projects.id)

The project this task belongs to.

current_stage_id

UUID

FK (workflow_stages.id), Nullable

The current stage of the task. NULL if completed.

is_complete

BOOLEAN

Not Null, Default false

A flag indicating if the task has successfully exited the workflow.

completed_at

TIMESTAMP

Nullable

Timestamp when is_complete was set to true.

task_assignments
Tracks the specific work assigned to users at each stage.

Column Name

Data Type

Constraints

Description

id

UUID

Primary Key

Unique identifier for the assignment.

task_id

UUID

Foreign Key (tasks.id)

The parent task.

stage_id

UUID

Foreign Key (workflow_stages.id)

The specific stage this assignment belongs to.

assigned_to

UUID

Foreign Key (users.id)

The user this work is assigned to.

status

VARCHAR(50)
(assignment_status: PENDING, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED)

Not Null

PENDING, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED.

review_data

JSONB



Stores review-specific data like rejection reasons or comments.

created_at

TIMESTAMP

Not Null

Timestamp of assignment creation.

submitted_at

TIMESTAMP

Nullable

Timestamp when the user submitted their work.

The users, roles, projects, data_items, and models tables are unchanged from the previous version.


1. Final Business Logic: The Workflow Engine
The Workflow Engine is the system's brain. It's not a single service but a set of business rules triggered by changes in the database, primarily the task_assignments table.

State Management & Transactional Integrity
The engine operates on a clear separation of states:

Task State: A task's state is its location in the workflow graph, defined by current_stage_id.

Assignment Status: A task_assignment's status reflects a user's progress on a piece of work (pending, submitted, etc.).

Crucially, all state transitions must be transactional. When the engine decides to move a task from Stage A to Stage B, the following database operations must succeed or fail together:

UPDATE tasks SET current_stage_id = 'stage_b_id' WHERE id = 'task_id'

INSERT INTO task_assignments (task_id, stage_id, ...) for all new assignments in Stage B.

This prevents tasks from getting "stuck" in an inconsistent state.

Core Logic Flow
Trigger: An action updates a task_assignment status to submitted (or approved/rejected for reviews).

Load Context: The engine is invoked for that task_id. It loads the task's current_stage_id and all sibling task_assignments for that stage.

Check for Stage Completion: It checks if all required assignments for the current stage are complete (e.g., all annotators have submitted, or the required reviewer has made a decision).

If No: The engine waits.

If Yes: It proceeds to the evaluation step.

Evaluate Outcome: Using the workflow_stages.type and config, it determines a success or failure outcome.

REVIEW: The outcome is directly based on the reviewer's choice. Their rejection reason is saved to task_assignments.review_data.

MITL: The outcome is always success. An annotation document is created and linked to the next stage's assignment(s) for the human reviewer to see.

CONSENSUS: The logic fetches all annotations linked to the stage's assignments, runs the configured strategy, and determines the outcome.

Transition Task:

Based on the outcome, it selects the on_success_stage_id or on_failure_stage_id.

It performs the atomic transaction to update the task's current_stage_id and create new pending assignments for the next stage.

If the target stage ID is NULL, the transaction marks the task with is_complete = true and completed_at = NOW().

Error Handling and Timeouts
External Service Failure: If an MITL stage's API call fails, the task should not get stuck. The system should have a retry mechanism (e.g., with exponential backoff). After several failed retries, the task should be automatically routed to a designated "Manual Fallback" stage.

Assignment Timeouts: The system can include a scheduler that periodically checks for task_assignments that have been in_progress for too long. These can be automatically unassigned and returned to the pending queue to be picked up by another user.

This final design provides a highly resilient, scalable, and auditable foundation for building a powerful, next-generation data annotation platform.