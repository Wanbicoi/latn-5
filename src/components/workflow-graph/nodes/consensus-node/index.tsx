import { WORKFLOW_STAGE_META } from "@/utils/stage-color";
import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { Form, InputNumber } from "antd";
import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { BaseNode } from "../base-node";

type ConsensusNode = Node<{ annotatorsCountRequired: number }>;
const META = WORKFLOW_STAGE_META.ROUTER;

export function ConsensusNode({
  id,
  data,
  selected,
}: NodeProps<ConsensusNode>) {
  const {
    setNodes,
    getNodes,
    getNode,
    deleteElements,
    addNodes,
    addEdges,
    getEdges,
  } = useReactFlow();
  const { annotatorsCountRequired } = data;
  const moveNode = (nodeId: string, newX: number, newY: number) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId ? { ...node, position: { x: newX, y: newY } } : node
      )
    );
  };
  useEffect(() => {
    const parentNode = getNode(id);
    if (!parentNode) return;

    const annotateNodes = getNodes().filter(
      (n) => n.parentId === id && n.type === "CONSENSUS_ANNOTATE"
    );
    deleteElements({ nodes: annotateNodes });

    const newAnnotateNodes = Array.from(
      { length: annotatorsCountRequired },
      (_, i) => {
        return {
          id: uuidv4(),
          type: "CONSENSUS_ANNOTATE",
          data: {},
          position: {
            x: i * 100,
            y: 160,
          },
          draggable: false,
          parentId: id,
        };
      }
    );
    addNodes(newAnnotateNodes);

    // Add Consensus Holding Node
    const existingHoldingNode = getNodes().find(
      (n) => n.type === "CONSENSUS_HOLDING" && n.parentId === id
    );
    let holdingNodeId = existingHoldingNode?.id;
    if (existingHoldingNode) {
      moveNode(
        existingHoldingNode.id,
        ((annotatorsCountRequired - 1) * 100) / 2,
        260
      );
    } else {
      const holdingNode = {
        id: uuidv4(),
        type: "CONSENSUS_HOLDING",
        data: {},
        position: {
          x: ((annotatorsCountRequired - 1) * 100) / 2,
          y: 260,
        },
        draggable: false,
        parentId: id,
      };
      holdingNodeId = holdingNode.id;
      addNodes([holdingNode]);
    }

    const existingReviewNode = getNodes().find(
      (n) => n.type === "CONSENSUS_REVIEW" && n.parentId === id
    );

    if (existingReviewNode) {
      moveNode(
        existingReviewNode.id,
        ((annotatorsCountRequired - 1) * 100) / 2,
        320
      );
      return;
    }
    const reviewNodes = [
      {
        id: uuidv4(),
        type: "CONSENSUS_REVIEW",
        data: {},
        position: {
          x: ((annotatorsCountRequired - 1) * 100) / 2,
          y: 320,
        },
        draggable: false,
        parentId: id,
      },
    ];
    addNodes(reviewNodes);
  }, [annotatorsCountRequired, id, getNode, getNodes, setNodes]);

  useEffect(() => {
    const annotateNodes = getNodes().filter(
      (n) => n.parentId === id && n.type === "CONSENSUS_ANNOTATE"
    );

    const holdingNode = getNodes().find(
      (n) => n.type === "CONSENSUS_HOLDING" && n.parentId === id
    );

    const existingReviewNode = getNodes().find(
      (n) => n.type === "CONSENSUS_REVIEW" && n.parentId === id
    );
    if (
      annotateNodes.length === annotatorsCountRequired &&
      holdingNode &&
      existingReviewNode
    ) {
      const existingEdges = getEdges().filter(
        (edge) =>
          edge.source === id ||
          edge.target === existingReviewNode.id ||
          edge.target === holdingNode.id ||
          edge.source === holdingNode.id
      );
      if (existingEdges.length > 0) {
        deleteElements({ edges: existingEdges });
      }

      addEdges([
        ...annotateNodes.map((node) => ({
          id: uuidv4(),
          source: id,
          target: node.id,
          animated: true,
        })),
        ...annotateNodes.map((node) => ({
          id: uuidv4(),
          source: node.id,
          target: holdingNode.id,
          animated: true,
        })),
        {
          id: uuidv4(),
          source: holdingNode.id,
          target: existingReviewNode.id,
          animated: true,
        },
      ]);
    }
  }, [getNodes().length, annotatorsCountRequired, id]);

  const { updateNodeData } = useReactFlow();

  return (
    <BaseNode
      selected={selected}
      data={{
        label: `Consensus`,
        icon: React.cloneElement(META.icon, {
          style: { color: META.color },
        }),
        handles: [
          {
            type: "target",
            position: Position.Left,
          },
          {
            type: "source",
            position: Position.Bottom,
          },
        ],
      }}
    >
      <Form.Item
        layout="vertical"
        label="Annotators required for each tasks"
        style={{ marginBottom: 0 }}
      >
        <InputNumber
          size="small"
          min={2}
          max={5}
          value={data.annotatorsCountRequired}
          onChange={(value) =>
            updateNodeData(id, { annotatorsCountRequired: value })
          }
        />
      </Form.Item>
    </BaseNode>
  );
}
