import { TreeStateContext } from "@/components/common/TreeStateContext";
import type { TreeNode } from "@/utils/treeReducer";
import { Box, Text } from "@mantine/core";
import {
    Background,
    Controls,
    type Edge,
    type Node,
    ReactFlow,
    useEdgesState,
    useNodesState,
    MarkerType,
    Handle,
    Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import clsx from "clsx";
import { memo, useCallback, useContext, useEffect, useMemo } from "react";
import { useStore } from "zustand";
import * as styles from "./TreeVisualization.css";
import { addPieceSymbol } from "@/utils/annotation";

interface MoveNodeData {
    label: string;
    san: string | null;
    halfMoves: number;
    path: number[];
    isCurrentPath: boolean;
    isPreviousMove: boolean;
    isRoot: boolean;
    score: string | null;
    [key: string]: unknown;
}

// Custom Move Node Component
const MoveNodeComponent = memo(function MoveNodeComponent({
    data,
}: {
    data: MoveNodeData;
}) {
    const moveNumber = Math.ceil((data.halfMoves) / 2);
    const isWhite = data.halfMoves % 2 === 1;
    const moveText = data.isRoot ? "Start" : data.san;
    const numberText = !data.isRoot ? `${moveNumber}${isWhite ? "." : "..."}` : "";

    return (
        <Box
            className={clsx(styles.moveNode, {
                [styles.nodeCurrentPath]: data.isCurrentPath && !data.isRoot,
                [styles.nodePreviousMove]: data.isPreviousMove && !data.isRoot,
                [styles.nodeRoot]: data.isRoot,
            })}
        >
            <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
            <div className={styles.nodeContent}>
                {numberText && <Text size="xs" c="dimmed" style={{ marginRight: 2 }}>{numberText}</Text>}
                <Text size="sm" fw={700}>
                    {data.isRoot ? "Start" : addPieceSymbol(moveText || "")}
                </Text>
            </div>
            {data.score && (
                <Text className={styles.nodeEvaluation}>{data.score}</Text>
            )}
            <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
        </Box>
    );
});

const nodeTypes = {
    moveNode: MoveNodeComponent,
};

// Check if a path is a prefix of another path
function isPathPrefix(prefix: number[], path: number[]): boolean {
    if (prefix.length > path.length) return false;
    for (let i = 0; i < prefix.length; i++) {
        if (prefix[i] !== path[i]) return false;
    }
    return true;
}

// Check if paths are equal
function pathsEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

// --- Custom Layout Algorithm ---
const NODE_WIDTH = 120;
const NODE_HEIGHT = 50;
const H_SPACING = 60;
const V_SPACING = 20; // Reduced vertical spacing for tighter packing similar to n8n

function calculateLayout(
    root: TreeNode,
    currentPosition: number[]
): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const previousPosition = currentPosition.length > 0 ? currentPosition.slice(0, -1) : [];

    // Calculate height of a subtree to determine vertical offsets
    function layoutParams(node: TreeNode): { height: number } {
        if (node.children.length === 0) return { height: NODE_HEIGHT };

        let totalHeight = 0;
        // Main line height
        const mainLineMeta = layoutParams(node.children[0]);
        totalHeight = mainLineMeta.height;

        // Variations height
        for (let i = 1; i < node.children.length; i++) {
            const varMeta = layoutParams(node.children[i]);
            totalHeight += varMeta.height + V_SPACING;
        }

        return { height: totalHeight };
    }

    function recursiveDraw(
        node: TreeNode,
        path: number[],
        parentId: string | null,
        x: number,
        startY: number
    ) {
        const nodeId = path.length === 0 ? "root" : `node-${path.join("-")}`;
        // Check if this node is on the current path by comparing each position element
        const isCurrentPath = path.length <= currentPosition.length &&
            path.every((val, i) => val === currentPosition[i]);
        const isPreviousMove = pathsEqual(path, previousPosition);

        let scoreText: string | null = null;
        if (node.score?.value) {
            const scoreValue = node.score.value;
            if (scoreValue.type === "cp") {
                const cp = scoreValue.value / 100;
                scoreText = cp >= 0 ? `+${cp.toFixed(1)}` : cp.toFixed(1);
            } else if (scoreValue.type === "mate") {
                scoreText = `M${scoreValue.value}`;
            }
        }

        nodes.push({
            id: nodeId,
            type: "moveNode",
            position: { x, y: startY },
            data: {
                label: node.san || "Start",
                san: node.san,
                halfMoves: node.halfMoves,
                path,
                isCurrentPath,
                isPreviousMove,
                isRoot: path.length === 0,
                score: scoreText,
            } as MoveNodeData,
            style: { width: NODE_WIDTH, height: NODE_HEIGHT },
        });

        if (parentId) {
            edges.push({
                id: `edge-${parentId}-${nodeId}`,
                source: parentId,
                target: nodeId,
                type: "smoothstep",
                style: {
                    stroke: isCurrentPath ? "var(--mantine-color-green-filled)" : "var(--mantine-color-gray-4)",
                    strokeWidth: isCurrentPath ? 2 : 1,
                },
                animated: isCurrentPath,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: isCurrentPath ? "var(--mantine-color-green-filled)" : "var(--mantine-color-gray-4)",
                },
            });
        }

        if (node.children.length === 0) return;

        // Main Line goes on the same Y (Sequential connection)
        recursiveDraw(node.children[0], [...path, 0], nodeId, x + NODE_WIDTH + H_SPACING, startY);

        // Variations are stacked BELOW, starting after the main line's subtree height
        let currentVarY = startY + layoutParams(node.children[0]).height + V_SPACING;

        for (let i = 1; i < node.children.length; i++) {
            recursiveDraw(node.children[i], [...path, i], nodeId, x + NODE_WIDTH + H_SPACING, currentVarY);
            currentVarY += layoutParams(node.children[i]).height + V_SPACING;
        }
    }

    recursiveDraw(root, [], null, 0, 0);
    return { nodes, edges };
}

function TreeVisualization() {
    const store = useContext(TreeStateContext)!;
    const root = useStore(store, (s) => s.root);
    const position = useStore(store, (s) => s.position);
    const goToMove = useStore(store, (s) => s.goToMove);

    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        return calculateLayout(root, position);
    }, [root, position]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(() => {
        const { nodes: newNodes, edges: newEdges } = calculateLayout(root, position);
        setNodes(newNodes);
        setEdges(newEdges);
    }, [root, position, setNodes, setEdges]);

    const onNodeClick = useCallback(
        (_event: React.MouseEvent, node: Node) => {
            const data = node.data as MoveNodeData;
            goToMove(data.path);
        },
        [goToMove]
    );

    return (
        <Box className={styles.treeContainer}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.1}
                maxZoom={2}
                attributionPosition="bottom-left"
            >
                <Background gap={20} size={1} color="var(--mantine-color-gray-3)" />
                <Controls showInteractive={false} />
            </ReactFlow>
        </Box>
    );
}

export default memo(TreeVisualization);
