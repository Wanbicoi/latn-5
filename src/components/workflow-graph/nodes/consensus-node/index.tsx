import { WORKFLOW_STAGE_META } from "@/utils/stage-color";
import {
  Node,
  NodeProps,
  Position,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { Form, InputNumber } from "antd";
import React, { useEffect } from "react";
import { BaseNode } from "../base-node";
import { v4 as uuidv4 } from "uuid";

type ConsensusNode = Node<{ annotatorsCountRequired: number }>;
const META = WORKFLOW_STAGE_META.ROUTER;

export function ConsensusNode({
  id,
  data,
  selected,
}: NodeProps<ConsensusNode>) {
  const { setNodes, getNodes, getNode, deleteElements, addNodes } =
    useReactFlow();
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
            x: i * 80,
            y: 160,
          },
          draggable: false,
          parentId: id,
        };
      }
    );
    addNodes(newAnnotateNodes);

    const existingReviewNode = getNodes().find(
      (n) => n.type === "CONSENSUS_REVIEW" && n.parentId === id
    );

    if (existingReviewNode) {
      moveNode(
        existingReviewNode.id,
        ((annotatorsCountRequired - 1) * 80) / 2,
        260
      );
      return;
    }
    const reviewNodes = [
      {
        id: uuidv4(),
        type: "CONSENSUS_REVIEW",
        data: {},
        position: {
          x: ((annotatorsCountRequired - 1) * 80) / 2,
          y: 260,
        },
        draggable: false,
        parentId: id,
      },
    ];
    addNodes(reviewNodes);
  }, [annotatorsCountRequired, id, getNode, getNodes, setNodes]);

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
          max={6}
          value={data.annotatorsCountRequired}
          onChange={(value) =>
            updateNodeData(id, { annotatorsCountRequired: value })
          }
        />
      </Form.Item>
    </BaseNode>
  );
}
