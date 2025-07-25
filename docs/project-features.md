# Project Features

This document outlines the features of the data annotation platform, leveraging the project's file structure and database schema.

## 1. Authorization and Access Control
The platform features a robust, granular authorization system based on Attribute-Based Access Control (ABAC) to provide fine-grained control over resources and actions.

- **Attribute-Based Access Control (ABAC)**: System access is managed by policies that evaluate attributes. Instead of assigning static roles, permissions are granted based on the attributes of the user, the resource they are trying to access, and the action they are trying to perform.
- **Fine-Grained Permissions**: Permissions are defined as `action` attributes (e.g., `create`, `delete`, `comment`) on `resource` attributes (e.g., `project`, `task`, `assignment`). This allows for highly granular and flexible security policies.
- **Contextual Access**: Access decisions are contextual. A user's permissions are determined by their role within a specific project, which acts as a key attribute in the policy evaluation.
- **Secure User Authentication**: User identity is managed through Supabase Auth, ensuring secure and reliable authentication. User profiles store additional information like full name and avatar, which can also be used as attributes in access control policies.

| Resource      | Action | Implementation File(s)                                                                   |
| :------------ | :----- | :--------------------------------------------------------------------------------------- |
| `permissions` | `list` | [`supabase/views/permissions.sql`](supabase/views/permissions.sql)                       |
| `permissions` | `edit` | [`supabase/functions/permissions_toggle.sql`](supabase/functions/permissions_toggle.sql) |

## 2. Workflow Management
The core of the platform is a powerful and flexible workflow engine that allows for the creation of complex data processing pipelines.

- **Dynamic Workflow Graphs**: Workflows are defined as directed graphs, consisting of stages (nodes) and connections (edges). This visual representation is stored and can be customized for each project.
- **Customizable Stages**: Each stage in a workflow has a specific type (e.g., `ANNOTATE`, `REVIEW`, `CONSENSUS`) and can have its own custom configuration. Stages can also be nested to create sub-workflows.
- **Conditional Logic**: Workflows support conditional branching, with distinct paths for success and failure scenarios at each stage.
- **Automated Assignee Selection**: The system can automatically determine the next assignee for a task based on functions associated with each workflow stage, enabling complex routing logic.

| Resource    | Action     | Implementation File(s)                                                                                                                   |
| :---------- | :--------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `workflows` | `create`   | [`supabase/functions/workflows_create.sql`](supabase/functions/workflows_create.sql)                                                     |
| `workflows` | `edit`     | [`src/pages/projects/show/workflow-tab.tsx`](src/pages/projects/show/workflow-tab.tsx)                                                   |
| `workflows` | `delete`   | [`src/pages/projects/show/workflow-tab.tsx`](src/pages/projects/show/workflow-tab.tsx)                                                   |
| `workflows` | `list`     | [`src/pages/projects/show/workflow-tab.tsx`](src/pages/projects/show/workflow-tab.tsx)                                                   |
| `workflows` | `show`     | [`src/pages/projects/show/workflow-tab.tsx`](src/pages/projects/show/workflow-tab.tsx)                                                   |
| `workflow`  | `annotate` | [`supabase/functions/workflow/actions/workflow_annotate_submit.sql`](supabase/functions/workflow/actions/workflow_annotate_submit.sql)   |
| `workflow`  | `review`   | [`supabase/functions/workflow/actions/workflow_annotate_approve.sql`](supabase/functions/workflow/actions/workflow_annotate_approve.sql) |
| `workflow`  | `comment`  | [`supabase/functions/workflow/actions/workflow_annotate_comment.sql`](supabase/functions/workflow/actions/workflow_annotate_comment.sql) |

## 3. Project & Task Management
The platform provides comprehensive tools for managing projects and the tasks within them.

- **Centralized Project Hub**: Projects serve as the main container for data, tasks, and user assignments. Each project has a name, description, and associated members.
- **Task Lifecycle Management**: Tasks represent individual units of work linked to a specific data item. They progress through various statuses (e.g., `PENDING`, `COMPLETED`) as they move through a workflow.
- **Detailed Task Assignments**: A task is processed in a workflow via assignments. Each assignment links a task to a user at a specific workflow stage and tracks its status, start time, and stop time.
- **Organizational Tagging**: Projects can be categorized using a flexible tagging system. Tags are color-coded for easy visual identification.

| Resource       | Action   | Implementation File(s)                                                                     |
| :------------- | :------- | :----------------------------------------------------------------------------------------- |
| `projects`     | `create` | [`supabase/functions/projects_create.sql`](supabase/functions/projects_create.sql)         |
| `projects`     | `edit`   | [`supabase/functions/projects_update.sql`](supabase/functions/projects_update.sql)         |
| `projects`     | `delete` | [`supabase/functions/projects_delete.sql`](supabase/functions/projects_delete.sql)         |
| `projects`     | `list`   | [`src/pages/projects/list.tsx`](src/pages/projects/list.tsx)                               |
| `projects`     | `show`   | [`src/pages/projects/list.tsx`](src/pages/projects/list.tsx)                               |
| `tasks`        | `list`   | [`src/pages/projects/show/tasks-tab.tsx`](src/pages/projects/show/tasks-tab.tsx)           |
| `tasks`        | `submit` | [`src/pages/projects/show/tasks-tab.tsx`](src/pages/projects/show/tasks-tab.tsx)           |
| `project_tags` | `create` | [`supabase/functions/project_tags_create.sql`](supabase/functions/project_tags_create.sql) |
| `project_tags` | `list`   | [`src/pages/tags/list.tsx`](src/pages/tags/list.tsx)                                       |
| `project_tags` | `edit`   | [`src/pages/tags/list.tsx`](src/pages/tags/list.tsx)                                       |
| `project_tags` | `delete` | [`src/pages/tags/list.tsx`](src/pages/tags/list.tsx) (commented out)                       |

## 4. Member Management
The platform provides tools for managing users and their roles within projects.

- **User Management**: Create, list, and edit users in the system.
- **Project-Level Roles**: Assign roles to users on a per-project basis.

| Resource          | Action   | Implementation File(s)                                                                                                                       |
| :---------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `members`         | `list`   | [`src/pages/members/list.tsx`](src/pages/members/list.tsx)                                                                                   |
| `members`         | `create` | [`src/pages/members/create.tsx`](src/pages/members/create.tsx)                                                                               |
| `members`         | `edit`   | [`src/pages/members/list.tsx`](src/pages/members/list.tsx), [`supabase/functions/members_update.sql`](supabase/functions/members_update.sql) |
| `project_members` | `edit`   | [`supabase/functions/project_members_update.sql`](supabase/functions/project_members_update.sql)                                             |

## 5. Annotation & Collaboration
The platform is designed to facilitate efficient and accurate data annotation through a collaborative environment.
- **Integrated Annotation Tools**: The platform leverages OHIF Viewer, MONAI, and Orthanc for annotation workflows, supporting advanced medical imaging and AI-assisted labeling.

- **Annotation Commenting**: Users can leave comments on task assignments, allowing for rich discussions and feedback. Comments can include structured data for detailed annotations.
- **Data Source Integration**: The system can connect to external data sources, such as medical imaging archives (e.g., Orthanc), to pull in data items for annotation.
- **Segmentation Data**: Tasks can store lists of segmentation IDs, which are essential for image-based annotation tasks.

| Resource      | Action    | Implementation File(s)                                                                                                                   |
| :------------ | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| `annotations` | `comment` | [`supabase/functions/workflow/actions/workflow_annotate_comment.sql`](supabase/functions/workflow/actions/workflow_annotate_comment.sql) |
| `annotations` | `list`    | [`supabase/views/annotation_comments.sql`](supabase/views/annotation_comments.sql)                                                       |

## 6. Notifications
A built-in notification system keeps users informed about important events.

- **Event-Driven Notifications**: Users receive notifications for key events, such as being assigned a new task or when a workflow action requires their attention.
- **Custom Payloads**: Notifications carry a payload with contextual data, providing users with the necessary information directly.
- **View Tracking**: The system tracks whether a notification has been viewed, ensuring users don't miss critical updates.

## 7. System Integrations
The platform can be extended by integrating with external systems and models.

- **Machine Learning Model Integration**: The system can connect to external ML models by storing their API endpoints. This allows for features like model-assisted labeling (MITL).

## 8. Testing and Reliability
- **E2E Tests**: Validate workflows with end-to-end testing, implemented in [`e2e-basic-flow.sql`](supabase/tests/e2e-basic-flow.sql).
- **Idempotent Functions**: Ensure consistent backend operations, following templates in [`functions`](supabase/functions/).
- **Atomic Transactions**: Maintain data integrity during multi-step processes, supported by SQL logic in [`projects_update.sql`](supabase/functions/projects_update.sql).

## 9. Documentation
- **Technical Specifications**: Detailed guidelines for backend and frontend development, available in [`technical.md`](docs/technical.md).
- **Concepts Overview**: High-level explanations of platform functionality, outlined in [`concepts.md`](docs/concepts.md).
- **Project Plan**: Research and planning documentation, found in [`project-plan-research.md`](docs/project-plan-research.md).