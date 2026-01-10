import React, { useMemo, useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  ConnectionLineType,
  BackgroundVariant,
  NodeProps,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ValueChain, ValueChainSegment } from '@/types/valueChain';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, ChevronDown, Flag, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowCanvasProps {
  chain: ValueChain;
  onSegmentClick?: (segment: ValueChainSegment) => void;
  onAddSegment?: () => void;
}

// Custom Node Component
const WorkflowNode = ({ data, selected }: NodeProps) => {
  const isStart = data.isStart;
  
  return (
    <div className={cn(
      "relative group",
      selected && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg"
    )}>
      {/* Input Handle */}
      {!isStart && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-primary !border-2 !border-background"
        />
      )}
      
      {/* Node Card */}
      <div 
        className={cn(
          "min-w-[180px] max-w-[220px] bg-card border-2 rounded-xl shadow-lg transition-all duration-200 cursor-pointer",
          isStart ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50",
          selected && "border-primary"
        )}
        onClick={() => data.onClick?.(data.segment)}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            {isStart && <Flag className="h-3.5 w-3.5 text-primary" />}
            <span className="text-xs font-medium text-muted-foreground">
              {isStart ? 'Début' : `Étape ${data.index}`}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        
        {/* Content */}
        <div className="p-3">
          <h4 className="font-semibold text-sm text-foreground mb-2 line-clamp-2">
            {data.label}
          </h4>
          
          {/* Actors */}
          <div className="space-y-1.5">
            {data.actors?.slice(0, 3).map((actor: any) => (
              <div key={actor.id} className="flex items-center gap-2">
                <Avatar className="h-5 w-5 border border-border">
                  <AvatarImage src={actor.photo} />
                  <AvatarFallback className="text-[8px] bg-primary/10">
                    {actor.firstName?.[0]}{actor.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate">
                  {actor.firstName} {actor.lastName}
                </span>
              </div>
            ))}
            
            {data.sections?.slice(0, 2).map((section: any) => (
              <div key={section.id} className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {section.title}
                </span>
              </div>
            ))}
            
            {data.actors?.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{data.actors.length - 3} autres
              </span>
            )}
            
            {(!data.actors?.length && !data.sections?.length) && (
              <span className="text-xs text-muted-foreground/60 italic">
                Aucun acteur
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
      
      {/* Connection point decoration */}
      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

// Add Node Button
const AddNodeButton = ({ data }: NodeProps) => {
  return (
    <button
      onClick={data.onClick}
      className="w-10 h-10 rounded-full bg-card border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all duration-200 group"
    >
      <Plus className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary/40 !border-2 !border-background opacity-0"
      />
    </button>
  );
};

const nodeTypes = {
  workflow: WorkflowNode,
  addNode: AddNodeButton,
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  chain,
  onSegmentClick,
  onAddSegment,
}) => {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!chain.segments || chain.segments.length === 0) {
      // Show only add button when no segments
      const nodes: Node[] = onAddSegment ? [{
        id: 'add-first',
        type: 'addNode',
        position: { x: 200, y: 150 },
        data: { onClick: onAddSegment },
      }] : [];
      
      return { nodes, edges: [] };
    }

    const HORIZONTAL_SPACING = 280;
    const VERTICAL_OFFSET = 100;
    
    // Create a more organic layout with slight vertical variations
    const nodes: Node[] = chain.segments.map((segment, index) => {
      // Create slight vertical wave for visual interest
      const yOffset = Math.sin(index * 0.8) * 30;
      
      return {
        id: segment.id,
        type: 'workflow',
        position: { 
          x: 100 + (index * HORIZONTAL_SPACING), 
          y: VERTICAL_OFFSET + yOffset 
        },
        data: {
          label: segment.function_name,
          actors: segment.actors || [],
          sections: segment.sections || [],
          segment,
          index: index + 1,
          isStart: index === 0,
          onClick: onSegmentClick,
        },
      };
    });

    // Add "Add new segment" button at the end
    if (onAddSegment) {
      const lastNode = nodes[nodes.length - 1];
      nodes.push({
        id: 'add-new',
        type: 'addNode',
        position: { 
          x: lastNode.position.x + HORIZONTAL_SPACING, 
          y: VERTICAL_OFFSET 
        },
        data: { onClick: onAddSegment },
      });
    }

    // Create curved edges between nodes
    const edges: Edge[] = chain.segments.slice(0, -1).map((segment, index) => {
      const nextSegment = chain.segments![index + 1];
      return {
        id: `e-${segment.id}-${nextSegment.id}`,
        source: segment.id,
        target: nextSegment.id,
        type: 'smoothstep',
        animated: false,
        style: {
          stroke: 'hsl(var(--primary))',
          strokeWidth: 3,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
          width: 20,
          height: 20,
        },
      };
    });

    // Add edge to "add new" button
    if (onAddSegment && chain.segments.length > 0) {
      const lastSegment = chain.segments[chain.segments.length - 1];
      edges.push({
        id: `e-${lastSegment.id}-add-new`,
        source: lastSegment.id,
        target: 'add-new',
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: 'hsl(var(--primary) / 0.3)',
          strokeWidth: 2,
          strokeDasharray: '5,5',
        },
      });
    }

    return { nodes, edges };
  }, [chain, onSegmentClick, onAddSegment]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when chain changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (!chain) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        Sélectionnez une chaîne de valeur
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden bg-muted/30 border border-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color="hsl(var(--muted-foreground) / 0.15)"
        />
        <Controls 
          showInteractive={false}
          className="!bg-card !border-border !shadow-md"
        />
      </ReactFlow>
    </div>
  );
};
