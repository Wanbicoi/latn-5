CREATE TYPE public_v2.assignment_status AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED');

CREATE TYPE public_v2.task_status AS ENUM('PENDING', 'ARCHIVED', 'COMPLETED');

CREATE TYPE public_v2.notification_type AS ENUM(
    'ASSIGNMENT_CREATED',
    'STATUS_CHANGED',
    'MENTION',
    'TIMEOUT_WARNING',
    'GENERAL',
);

CREATE TYPE public_v2.stage_type AS ENUM(
    'START',
    'ANNOTATE',
    'REVIEW',
    'CONSENSUS',
    'CONSENSUS_REVIEW',
    'CONSENSUS_ANNOTATE',
    'MITL',
    'ROUTER',
    'SUCCESS',
    'ARCHIVED',
    'CONSENSUS_HOLDING'
);