# Data Annotation Platform: Dynamic Workflow Composition

## File Naming Convention

- Use **kebab-case** for **ALL** files and directories.

## Overview

This platform is designed for flexibility, auditability, and scalability in data annotation, inspired by Encord and supporting Model-in-the-Loop (MITL), routing, and consensus. Workflows are composed as directed graphs of modular stages, supporting both simple and complex pipelines. Supabase (PostgreSQL) is used for the backend, with atomic operations via SQL functions. The frontend is built with React, using [refine.dev](https://refine.dev/) and Ant Design. Core business logic is isolated in a dedicated folder.

### Core Principles (from [`concepts.md`](concepts.md))
- **Flexibility through Composition:** Workflows are built by linking modular stages into a directed graph, enabling both simple and complex, logic-driven pipelines.
- **Decoupled Intelligence:** The platform does not host models or complex business logic directly. It communicates with external services (e.g., model inference API) and contains its own logic within a Workflow Engine, which orchestrates task movement between stages.

---

## Table Schema (PostgreSQL, Supabase)
### Supabase Folder Structure & Naming Conventions

- The `supabase` directory organizes all database-related code:
  - **Table schemas** are stored in the root of `supabase/` (e.g., [`supabase/tables.sql`](../supabase/tables.sql)).
  - **Views** are stored in [`supabase/views/`](../supabase/views/).
  - **SQL functions** are stored in [`supabase/functions/`](../supabase/functions/).
- Whenever there are changes to SQL functions or views, these should be reflected in their respective folders to ensure version control and consistency.
- The application relies heavily on database views for business logic and data access.
- All core tables should be prefixed with an underscore (e.g., `_projects`). The corresponding view (e.g., `projects`) can join multiple core tables as needed.

**Key Tables:**
- `workflows`: Workflow templates (id, name, description, is_active, created_by, created_at)
- `workflow_stages`: Stages/nodes in a workflow (id, workflow_id, name, description, type, config, on_success_stage_id, on_failure_stage_id)
- `tasks`: Data items moving through a workflow (id, data_item_id, project_id, current_stage_id, is_complete, completed_at)
- `task_assignments`: Work assigned to users at each stage (id, task_id, stage_id, assigned_to, status, review_data, created_at, submitted_at)
- `users`, `roles`, `projects`, `data_items`, `models`: For user management, RBAC, project grouping, and data/model integration.
- **Extensions:** `project_tags` (for tagging projects), `notifications` (for user alerts), `datasource_integrations` (for Orthanc sync).

---

## Core Business Logic

### Workflow Engine (Backend, SQL Functions)
- **State Management:**  
  - Task state is tracked by `current_stage_id` in `tasks`.
  - Assignment status is tracked in `task_assignments.status` (PENDING, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED).
- **Transactional Integrity:**  
  - All state transitions are atomic (update task stage, create assignments).
- **Logic Flow:**  
  1. Triggered by status change in `task_assignments`.
  2. Loads context for the task and assignments.
  3. Checks if all assignments for the stage are complete.
  4. Evaluates outcome based on stage type and config:
     - **REVIEW:** Based on reviewer decision; rejection reason saved.
     - **MITL:** Always success; annotation doc created for next stage.
     - **CONSENSUS:** Aggregates annotations, applies strategy.
  5. Transitions task to next stage or marks as complete.
  6. Handles external API failures (MITL) with retries and fallback routing.

### Frontend (React)
- **Dynamic Workflow Builder:**  
  - Graph editor for stages and transitions.
  - Stage types: ANNOTATE, REVIEW, CONSENSUS, MITL, ROUTER.
- **Task Dashboard:**  
  - Filter by stage, status, user, project tags.
  - Show completed, next, problematic tasks, and time spent.
- **Role-Based Features:**  
  - RBAC for dashboard, member management, workflow editing, and annotation/review.
- **Member Management:**  
  - Assign/remove users to/from projects, manage roles.
- **Datasource Integration:**  
  - Sync Orthanc data into the app, track sync status.
- **Notifications:**  
  - Real-time and scheduled notifications for assignments, status changes, issues, and timeouts.
- **Project Tags:**  
  - Tag projects for filtering, reporting, and workflow assignment.
- **Business Logic Isolation:**  
  - All workflow evaluation, routing, and state transition logic is in a `/core` folder in the React app.

---

## Feature Implementation Plan

### 1. Project Setup & Platform Foundation
- Supabase project, PostgreSQL, and migrations.
- Refine/Ant Design setup and configuration.
- DevOps, CI/CD, and documentation.

### 2. Core Workflow & Engine
- Workflow schema and migrations.
- Workflow Engine SQL functions for state transitions.
- Task lifecycle management (API/UI).
- Assignment and routing logic.

### 3. Workflow Builder & UI
- UI to create/edit workflow templates as directed graphs.
- Stage types: ANNOTATE, REVIEW, CONSENSUS, MITL, ROUTER.
- Save to `workflows` and `workflow_stages`.

### 4. Advanced Workflow Features
- Model-in-the-Loop (MITL) integration with external APIs, retry/fallback logic.
- Consensus logic and UI for multi-user annotation.
- Routing logic based on config.

### 5. Integrations
- Datasource integration (Orthanc sync service, backend job or webhook).
- OHIF Viewer activities/review integration.

### 6. Platform & User Management
- RBAC (roles, policies, enforcement) for all features.
- Member management UI for projects and roles.
- Project tags (schema, UI, filtering, reporting).
- Dashboard overview (completed, PENDING, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED, issues, time spent, drill-down).
- Notifications (schema, logic, UI, preferences).

---

## Action Plan & Timeline

Below is a step-by-step, actionable timeline for implementation. Each step is sequential and includes both backend and frontend tasks, with estimated durations. Tasks can be parallelized where noted.

### Project Setup & Foundation
- Supabase project creation, PostgreSQL setup, initial migrations. Refine/Ant Design setup, project scaffolding, DevOps, CI/CD (1h)
- Datasource integration (Orthanc sync service, backend job/webhook) (1h)
- Setup reverse proxy for OHIF/Orthanc authentication (1h)

### Core Workflow & Engine
- Design and implement workflow schema, migrations (1h)
- Implement Workflow Engine SQL functions for state transitions (2h)
- Task lifecycle management API and UI (2h)
- Assignment and routing logic (1h)

### Workflow Builder & UI
- Build workflow builder UI (graph editor for stages, transitions) (3h)
- Integrate stage types: ANNOTATE, REVIEW, CONSENSUS, MITL, CONDITION (1h)
- Save/load workflows and stages (1h)

### Advanced Workflow Features
- MITL integration (API, retries, fallback) (3h)
- Consensus logic and UI (1h)
- Routing logic (1h)

### Platform & User Management
- RBAC (roles, policies, enforcement) (1h)
- Member management UI for projects and roles (1h)
- Project tags (schema, UI, filtering, reporting) (1h)
- Dashboard overview (completed, PENDING, IN_PROGRESS, SUBMITTED, APPROVED, REJECTED, issues, time spent, drill-down) (2h)
- Notifications (schema, logic, UI, preferences) (2h)

### OHIF Viewer Integration
- Activities/comments (2h)
- Review: Approve/Reject (2h)

**Total Estimated Timeline:** 31 hours

---

## Project Setup

1. **Supabase**
   - Create project, enable PostgreSQL.
   - Define tables and relationships as above.
   - Write SQL functions for all atomic transitions.
   - Set up triggers for workflow engine logic.
   - Add tables for notifications, project tags, and datasource integrations.

2. **React (Refine + Ant Design)**
   - Scaffold app with Refine.
   - Configure Supabase client.
   - Set up routing, authentication, and RBAC.
   - Install Ant Design and Refine adapters.
   - Set up websocket or polling for notifications.
