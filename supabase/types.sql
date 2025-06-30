CREATE TYPE public_v2.assignment_status AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED');

CREATE TYPE public_v2.notification_type AS ENUM(
    'ASSIGNMENT_CREATED',
    'STATUS_CHANGED',
    'MENTION',
    'TIMEOUT_WARNING'
);

CREATE TYPE public_v2.stage_type AS ENUM(
    'ANNOTATE',
    'REVIEW',
    'CONSENSUS',
    'MITL',
    'ROUTER',
    'SUCCESS',
    'ARCHIVED'
);