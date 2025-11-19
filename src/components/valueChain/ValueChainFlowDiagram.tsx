import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ValueChain } from '@/types/valueChain';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ValueChainFlowDiagramProps {
  chain: ValueChain;
  onSegmentClick?: (segmentId: string) => void;
}

const SegmentNode = ({ data }: any) => {
  return (
    <Card className="p-4 min-w-[200px] max-w-[300px] bg-card border-2 border-border shadow-lg">
      <div className="font-semibold text-sm mb-3 text-foreground">{data.label}</div>
      <div className="space-y-2">
        {/* Display people actors */}
        {data.actors && data.actors.length > 0 && data.actors.map((actor: any) => (
          <div key={actor.id} className="flex items-center gap-2 text-xs">
            <Avatar className="h-6 w-6">
              <AvatarImage src={actor.photo} alt={`${actor.firstName} ${actor.lastName}`} />
              <AvatarFallback className="text-[10px]">
                {actor.firstName?.[0]}{actor.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground truncate">
              {actor.firstName} {actor.lastName}
            </span>
          </div>
        ))}
        {/* Display section actors */}
        {data.sections && data.sections.length > 0 && data.sections.map((section: any) => (
          <Badge key={section.id} variant="outline" className="text-xs flex items-center gap-1">
            {section.title}
          </Badge>
        ))}
        {(!data.actors || data.actors.length === 0) && (!data.sections || data.sections.length === 0) && (
          <Badge variant="outline" className="text-xs">Aucun acteur</Badge>
        )}
      </div>
    </Card>
  );
};

const nodeTypes = {
  segment: SegmentNode,
};

export const ValueChainFlowDiagram: React.FC<ValueChainFlowDiagramProps> = ({
  chain,
  onSegmentClick,
}) => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!chain.segments || chain.segments.length === 0) {
      return { nodes: [], edges: [] };
    }

    const nodes: Node[] = chain.segments.map((segment, index) => ({
      id: segment.id,
      type: 'segment',
      position: { x: index * 350, y: 100 },
      data: {
        label: segment.function_name,
        actors: segment.actors || [],
        sections: segment.sections || [],
      },
    }));

    const edges: Edge[] = chain.segments.slice(0, -1).map((segment, index) => ({
      id: `e${segment.id}-${chain.segments![index + 1].id}`,
      source: segment.id,
      target: chain.segments![index + 1].id,
      type: 'smoothstep',
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'hsl(var(--primary))',
      },
      style: {
        stroke: 'hsl(var(--primary))',
        strokeWidth: 2,
      },
    }));

    return { nodes, edges };
  }, [chain]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onSegmentClick) {
        onSegmentClick(node.id);
      }
    },
    [onSegmentClick]
  );

  if (!chain.segments || chain.segments.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        Aucun segment dans cette chaîne
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full border border-border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background />
        <Controls />
        <Panel position="top-left" className="bg-background/80 backdrop-blur-sm p-2 rounded-md border border-border">
          <div className="text-sm font-semibold text-foreground">{chain.title}</div>
          {chain.description && (
            <div className="text-xs text-muted-foreground mt-1">{chain.description}</div>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
};
