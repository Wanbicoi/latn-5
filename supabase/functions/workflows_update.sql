-- workflows_update.sql
-- Atomic function to update workflow nodes and edges for a given workflow_id
CREATE OR REPLACE FUNCTION public_v2.workflows_update (workflow_id UUID, nodes JSONB, edges JSONB) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    -- Update graph_data column with nodes and edges
    UPDATE public_v2._workflows
    SET graph_data = jsonb_build_object('nodes', nodes, 'edges', edges)
    WHERE id = workflow_id;

    
END;
$$;