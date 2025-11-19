'use client';

import React, { useMemo, useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MindMapNode {
  id: string;
  title: string;
  children: MindMapNode[];
  level: number;
  type?: 'header' | 'bullet';
}

interface InteractiveMindMapProps {
  markdown: string;
}

export default function InteractiveMindMap({ markdown }: InteractiveMindMapProps) {
  // Calculate initial collapsed nodes (nodes with bullet children should start collapsed)
  const initialCollapsedNodes = useMemo(() => {
    const mindMapTree = parseMindMap(markdown);
    const collapsedIds = new Set<string>();

    const findNodesToCollapse = (node: MindMapNode) => {
      // Check if this node has bullet-type children
      const hasBulletChildren = node.children.some(child => child.type === 'bullet');

      if (hasBulletChildren) {
        collapsedIds.add(node.id);
      }

      // Recursively process children
      node.children.forEach(findNodesToCollapse);
    };

    findNodesToCollapse(mindMapTree);
    return collapsedIds;
  }, [markdown]);

  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(initialCollapsedNodes);

  // Reset collapsed nodes when markdown changes
  React.useEffect(() => {
    setCollapsedNodes(initialCollapsedNodes);
  }, [initialCollapsedNodes]);

  const toggleNodeCollapse = useCallback((nodeId: string) => {
    setCollapsedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
    const mindMapTree = parseMindMap(markdown);

    const visibleNodeIds = new Set<string>();
    const allNodes: MindMapNode[] = [];

    const processNode = (node: MindMapNode) => {
      allNodes.push(node);
      visibleNodeIds.add(node.id);

      if (!collapsedNodes.has(node.id)) {
        node.children.forEach(processNode);
      }
    };
    processNode(mindMapTree);

    const nodePositions = new Map<string, { x: number; y: number }>();
    const horizontalSpacing = 350;
    const verticalSpacing = 120;

    // Calcular altura da subárvore (quantos nós visíveis ela contém)
    const calculateTreeHeight = (node: MindMapNode): number => {
      if (collapsedNodes.has(node.id)) return 1;

      const visibleChildren = node.children.filter(child => visibleNodeIds.has(child.id));
      if (visibleChildren.length === 0) return 1;

      return visibleChildren.reduce((sum, child) => sum + calculateTreeHeight(child), 0);
    };

    // Posicionar nós em layout hierárquico horizontal (esquerda para direita)
    const calculatePositions = (node: MindMapNode, x: number, startY: number): number => {
      const visibleChildren = node.children.filter(child => visibleNodeIds.has(child.id));

      if (collapsedNodes.has(node.id) || visibleChildren.length === 0) {
        nodePositions.set(node.id, { x, y: startY });
        return startY + verticalSpacing;
      }

      // Calcular posições dos filhos primeiro
      let currentY = startY;
      const childYPositions: number[] = [];

      visibleChildren.forEach(child => {
        const childStartY = currentY;
        currentY = calculatePositions(child, x + horizontalSpacing, childStartY);

        // Pegar a posição Y real do filho após o cálculo
        const childPos = nodePositions.get(child.id);
        if (childPos) {
          childYPositions.push(childPos.y);
        }
      });

      // Posicionar o nó pai no centro vertical dos filhos
      if (childYPositions.length > 0) {
        const firstChildY = childYPositions[0];
        const lastChildY = childYPositions[childYPositions.length - 1];
        const nodeY = (firstChildY + lastChildY) / 2;
        nodePositions.set(node.id, { x, y: nodeY });
      } else {
        nodePositions.set(node.id, { x, y: startY });
      }

      return currentY;
    };

    calculatePositions(mindMapTree, 100, 100);

    const flowNodes: Node[] = Array.from(visibleNodeIds)
      .map(id => allNodes.find(n => n.id === id)!)
      .filter(Boolean)
      .map(node => {
        const pos = nodePositions.get(node.id)!;
        const hasChildren = node.children.length > 0;
        const isCollapsed = collapsedNodes.has(node.id);

        return {
          id: node.id,
          type: 'default',
          position: pos,
          data: {
            label: (
              <div className="relative">
                <div className="text-xs font-medium px-3 py-2 whitespace-normal max-w-[250px]">
                  {node.title}
                </div>
                {hasChildren && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNodeCollapse(node.id);
                    }}
                    className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-gray-300 text-gray-700 flex items-center justify-center text-xs font-bold hover:bg-gray-100 hover:border-gray-400 transition-colors z-10 shadow-sm"
                  >
                    {isCollapsed ? '+' : '-'}
                  </button>
                )}
              </div>
            ),
          },
          style: {
            background: node.level === 1 ? '#10b981' : node.level === 2 ? '#3b82f6' : node.level === 3 ? '#8b5cf6' : '#ec4899',
            color: 'white',
            border: '2px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '0',
            fontSize: '12px',
            fontWeight: '500',
            minWidth: '160px',
            maxWidth: '260px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        };
      });

    const flowEdges: Edge[] = [];
    allNodes.forEach(node => {
      if (!visibleNodeIds.has(node.id)) return;

      node.children.forEach(child => {
        if (visibleNodeIds.has(child.id)) {
          flowEdges.push({
            id: `${node.id}-${child.id}`,
            source: node.id,
            target: child.id,
            type: 'default',
            animated: false,
            style: {
              stroke: '#94a3b8',
              strokeWidth: 2,
            },
          });
        }
      });
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [markdown, collapsedNodes, toggleNodeCollapse]);

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  React.useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{
          padding: 0.3,
          minZoom: 0.1,
          maxZoom: 1.0,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
        minZoom={0.1}
        maxZoom={1.5}
        attributionPosition="bottom-left"
        className="bg-white"
      >
        <Controls />
      </ReactFlow>
    </div>
  );
}

function parseMindMap(markdown: string): MindMapNode {
  if (!markdown || typeof markdown !== 'string') {
    return { id: 'root', title: 'Mapa Mental', children: [], level: 0, type: 'header' };
  }

  const lines = markdown.split('\n').filter(line => line.trim());
  const root: MindMapNode = { id: 'root', title: 'Mapa Mental', children: [], level: 0, type: 'header' };
  const stack: MindMapNode[] = [root];

  let nodeIdCounter = 0;
  let lastHeaderNode: MindMapNode | null = null;

  lines.forEach(line => {
    const trimmedLine = line.trim();

    // Check if it's a header (# ## ###)
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const title = headerMatch[2].trim();

      const node: MindMapNode = {
        id: `node-${nodeIdCounter++}`,
        title,
        children: [],
        level,
        type: 'header',
      };

      while (stack.length > level) {
        stack.pop();
      }

      const parent = stack[stack.length - 1];
      parent.children.push(node);
      stack.push(node);

      lastHeaderNode = node;
      return;
    }

    // Check if it's a bullet point (- or *)
    const bulletMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
    if (bulletMatch && lastHeaderNode) {
      const content = bulletMatch[1].trim();

      // Create a child node for the bullet point content
      const bulletNode: MindMapNode = {
        id: `node-${nodeIdCounter++}`,
        title: content,
        children: [],
        level: lastHeaderNode.level + 1,
        type: 'bullet',
      };

      lastHeaderNode.children.push(bulletNode);
    }
  });

  return root;
}
