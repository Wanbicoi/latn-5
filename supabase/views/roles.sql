DROP VIEW IF EXISTS public_v2.roles;

CREATE OR REPLACE VIEW public_v2.roles
WITH
    (security_invoker = true) AS
SELECT
    *
FROM
    public_v2._roles
WHERE
    id NOT IN (
        '85f6644b-fd89-44e6-a9b9-2a400bc0c5f7',
        'e71252a4-cc30-4dda-812a-2eb25e1e461e'
    );