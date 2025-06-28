CREATE TYPE public.assignment_status AS ENUM(
    'PENDING',
    'IN_PROGRESS',
    'SUBMITTED',
    'APPROVED',
    'REJECTED'
);

CREATE TYPE public.notification_type AS ENUM(
    'ASSIGNMENT_CREATED',
    'STATUS_CHANGED',
    'MENTION',
    'TIMEOUT_WARNING'
);

CREATE TYPE public.stage_type AS ENUM(
    'ANNOTATE',
    'REVIEW',
    'CONSENSUS',
    'MITL',
    'ROUTER',
    'COMPLETE',
    'ARCHIVE'
);