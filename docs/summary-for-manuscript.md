# Data Annotation Platform: Summary for Thesis Manuscript

## Project Purpose
This platform is designed to provide a flexible, auditable, and scalable environment for data annotation, with a focus on dynamic workflow composition, fine-grained access control, and integration with external data sources and machine learning models. Inspired by platforms like Encord, it supports both simple and complex annotation pipelines, including Model-in-the-Loop (MITL), consensus, and routing logic.

## Core Features
- **Dynamic Workflow Engine**: Workflows are modeled as directed graphs of modular stages (e.g., ANNOTATE, REVIEW, CONSENSUS, MITL, ROUTER), allowing for customizable, logic-driven pipelines. State transitions and task assignments are managed atomically in the backend.
- **Attribute-Based Access Control (ABAC)**: Fine-grained, contextual permissions are enforced using user, resource, and action attributes. Project-level roles and Supabase Auth ensure secure, flexible access management.
- **Project & Task Management**: Projects serve as containers for data, tasks, and user assignments. Tasks move through workflow stages, with detailed tracking of assignments, statuses, and time spent. Tagging and filtering support organization and reporting.
- **Annotation & Collaboration**: Users can annotate, comment, and collaborate on tasks. The system supports structured annotation data, segmentation IDs, and real-time notifications for assignments and workflow events.
- **Integrations**: The platform integrates with external data sources and tools like Orthanc, OHIF Viewer, and MONAI to support advanced medical imaging workflows and AI-assisted labeling.
- **Testing & Reliability**: End-to-end tests, idempotent SQL functions, and atomic transactions ensure reliability and data integrity.

## Architecture & Technology Stack
- **Backend**: PostgreSQL on Supabase, leveraging SQL functions, triggers, and views for business logic, state management, and access control. All backend logic is self-contained in SQL, with a focus on atomicity and security.
- **Frontend**: React with Refine.dev and Ant Design, using a "Refine-first" approach for rapid development. The workflow builder UI is implemented with libraries like reactflow. Business logic for workflow evaluation is isolated in a dedicated core directory.
- **Tooling**: Vite for frontend tooling; npm/yarn for dependency management. DevOps and CI/CD practices are in place for maintainability.

## Unique Aspects
- **Graph-Based Workflow Composition**: Enables both simple and highly complex annotation pipelines, supporting conditional logic, automated assignee selection, and sub-workflows.
- **Decoupled Intelligence**: The platform orchestrates workflows and integrates with external services for model inference, without embedding complex ML logic directly.
- **Extensibility**: Modular design allows for easy integration of new stage types, data sources, and external APIs.
- **Auditability**: All actions, assignments, and state transitions are tracked for transparency and reproducibility.

## Implementation Highlights
- **Database Schema**: Core tables are prefixed with underscores and exposed via secure views. Business logic is implemented in SQL functions and mapped to frontend actions via RPC.
- **Frontend-Backend Integration**: Supabase data provider is swizzled for custom RPC mapping. All workflow and state logic is isolated for maintainability.
- **Testing**: E2E SQL-based tests validate workflows and ensure platform reliability.

---
This summary provides a foundation for developing a comprehensive thesis manuscript, covering the platform's motivation, architecture, features, and technical innovations. 