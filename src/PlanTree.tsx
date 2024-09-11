import React, { useCallback, useState } from 'react';
import { ExplainAnalyzeRow } from './utils/parser';
import { applyNodeChanges, Background, Controls, Node, NodeChange, ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import Dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/style.css';
import PlanNode from './PlanNode';
import { parsePlanProperties } from './utils/nodeParser';

const nodeTypes = { planNode: PlanNode };

const generateTreeNodeData = (rows: ExplainAnalyzeRow[]): any => {
    const buildTree = (nodes: ExplainAnalyzeRow[]) => {
        let maxStage = 0;
        nodes
            .forEach((row) => {
                if (row.stage === null || row.node === null) {
                    return
                }

                // inner nodes
                maxStage = Math.max(maxStage, row.stage);
                // const parentId = row.stage === 0 ? null : `${row.stage - 1}`;
                const nodeData = {
                    id: `${row.stage}-${row.node}`,
                    position: { x: 0, y: 0 },
                    // draggable: false,
                    // data: { label: row.plan[0] },
                    data: { label: `${row.stage}-${row.node}` },
                    // parentId: parentId,
                    // extent: 'parent',
                    zIndex: -1,
                    draggable: false,
                    selectable: false,
                    deletable: false,
                }
                treeNodeData.push(nodeData)

                // inner plan step nodes
                row.plan.forEach((planItem, index) => {
                    const nodeData = {
                        id: `${row.stage}-${row.node}-${index}`,
                        position: { x: 0, y: 0 },
                        data: parsePlanProperties(planItem),
                        parentId: `${row.stage}-${row.node}`,
                        // expandParent: true,
                        // extent: 'parent',
                        type: 'planNode',
                        draggable: false,
                        selectable: false,
                        deletable: false,
                    };
                    treeNodeData.push(nodeData);
                });
            });

        // parent nodes
        // for (let stage = 0; stage <= maxStage; stage++) {
        //     const nodeData = {
        //         id: `${stage}`,
        //         position: { x: 0, y: 0 },
        //         data: { label: `stage ${stage}` },
        //         style: {
        //             width: 300,
        //             height: 300,
        //         },
        //         type: 'group'
        //     };
        //     treeNodeData.push(nodeData);
        // }
    };

    const treeNodeData: any[] = [];
    buildTree(rows);

    return treeNodeData;
};

const generateTreeEdgeData = (rows: ExplainAnalyzeRow[]): any => {
    const treeEdgeData: any[] = [];
    let nodesPerStage: { [key: number]: number } = {}
    rows.forEach((row) => {
        if (row.stage === null || row.node === null) {
            return
        }
        if (nodesPerStage[row.stage] === undefined) {
            nodesPerStage[row.stage] = 0
        }
        nodesPerStage[row.stage] = Math.max(nodesPerStage[row.stage], row.node)

        for (let numStep = 1; numStep < row.plan.length; numStep++) {

            const targetId = `${row.stage}-${row.node}-${numStep}`;
            const sourceId = `${row.stage}-${row.node}-${numStep - 1}`;
            const edgeData = {
                id: `e-${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
                animated: false,
                style: { stroke: '#000' },
            };
            treeEdgeData.push(edgeData);
        }
    })

    Object.entries(nodesPerStage).forEach(([stage, maxNode]) => {
        if (stage === "0") {
            return;
        }

        for (let node = 0; node <= maxNode; node++) {
            const targetId = `${stage}-${node}`;
            const sourceId = `${parseInt(stage) - 1}-0`;
            treeEdgeData.push({
                id: `e-${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
                animated: true,
                style: { stroke: '#000' },
            });
        }
    });

    return treeEdgeData;
}

const getLayoutedElements = (nodes: any[], edges: any[], direction: string) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: direction });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 0,
            height: node.measured?.height ?? 0,
        }),
    );

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id);
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            const x = position.x - (node.measured?.width ?? 0) / 2;
            const y = position.y - (node.measured?.height ?? 0) / 2;

            return { ...node, position: { x, y } };
        }),
        edges,
    };
};

const LayoutTree: React.FC<{ rows: ExplainAnalyzeRow[] }> = ({ rows }) => {
    const { fitView } = useReactFlow();
    const [nodes, setNodes] = useState(generateTreeNodeData(rows));
    const [edges, setEdges] = useState(generateTreeEdgeData(rows));

    const onNodesChange = useCallback(
        (changes: NodeChange<Node>[]) => setNodes((nds: Node[]) => applyNodeChanges(changes, nds)),
        [setNodes],
    );

    const onLayout = useCallback(
        () => {
            let parentNodes = nodes.filter((node: { parentId: null | undefined; }) => node.parentId === null || node.parentId === undefined);
            const childNodes = nodes.filter((node: { parentId: null | undefined; }) => node.parentId !== null && node.parentId !== undefined);

            // Group childNodes by 'group' field
            const groupedChildNodes = childNodes.reduce((acc, node) => {
                const parentId = node.parentId || 'default';
                if (!acc[parentId]) {
                    acc[parentId] = [];
                }
                acc[parentId].push(node);
                return acc;
            }, {});

            // Layout child nodes by group
            const layoutedChildNodes = [];
            const groupedChildNodesArray = Object.values(groupedChildNodes);
            for (let i = 0; i < groupedChildNodesArray.length; i++) {
                const groupNodes = groupedChildNodesArray[i];
                const layoutedGroup = getLayoutedElements(groupNodes, edges, 'TB');
                layoutedChildNodes.push(...layoutedGroup.nodes);
            }

            // Compute parent node's size
            let parentSizes = new Map<string, { width: number; height: number }>();
            for (let i = 0; i < layoutedChildNodes.length; i++) {
                const childNode = layoutedChildNodes[i];
                const nodeX = childNode.position.x + (childNode.measured?.width ?? 0);
                const nodeY = childNode.position.y + (childNode.measured?.height ?? 0);
                if (!parentSizes.has(childNode.parentId)) {
                    parentSizes.set(childNode.parentId, { width: nodeX, height: nodeY });
                } else {
                    const maxWidth = Math.max(nodeX, parentSizes.get(childNode.parentId)!.width);
                    const maxHeight = Math.max(nodeY, parentSizes.get(childNode.parentId)!.height);
                    parentSizes.set(childNode.parentId, { width: maxWidth, height: maxHeight });
                }
            }
            for (let i = 0; i < parentNodes.length; i++) {
                if (parentSizes.has(parentNodes[i].id)) {
                    parentNodes[i].style = parentSizes.get(parentNodes[i].id)!;
                    parentNodes[i].measured = parentSizes.get(parentNodes[i].id)!;
                }
            }

            // Layout parent nodes
            const layoutedParentNodes = getLayoutedElements(parentNodes, edges, 'TB');

            setNodes([...layoutedParentNodes.nodes, ...layoutedChildNodes]);
            setEdges([...layoutedParentNodes.edges]);
            window.requestAnimationFrame(() => {
                fitView();
            });
        },
        [nodes, edges]
    )

    const handleRefresh = () => {
        setNodes(generateTreeNodeData(rows));
        setEdges(generateTreeEdgeData(rows));
        console.log("nodes: ", nodes)
    };

    const handleLayout = () => {
        onLayout()
    }

    return (
        <>
            <button onClick={handleRefresh} style={{ marginBottom: '10px' }}>Refresh</button>
            <button onClick={handleLayout} style={{ marginBottom: '10px' }}>layout</button>
            <div style={{ width: '80vw', height: '80vh', border: '1px solid gray', borderRadius: '5px' }}>
                <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} nodeTypes={nodeTypes} fitView attributionPosition="top-right">
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </>
    )
}

const PlanTree: React.FC<{ rows: ExplainAnalyzeRow[] }> = ({ rows }) => {
    return (
        <>
            <ReactFlowProvider>
                <LayoutTree rows={rows} />
            </ReactFlowProvider>
        </>
    );
};

export default PlanTree;
