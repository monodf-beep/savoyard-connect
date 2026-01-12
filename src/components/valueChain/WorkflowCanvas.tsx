import React, { useMemo, useCallback, useEffect, useRef } from 'react';
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
  useReactFlow,
  ReactFlowProvider,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ValueChain, ValueChainSegment } from '@/types/valueChain';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, ChevronDown, Flag, Plus, LayoutGrid, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WorkflowCanvasProps {
  chain: ValueChain;
  onSegmentClick?: (segment: ValueChainSegment) => void;
  onAddSegment?: () => void;
  onSegmentsReorder?: (segmentIds: string[]) => void;
}

// Custom Node Component
const WorkflowNode = ({ data, selected, dragging }: NodeProps) => {
  const isStart = data.isStart;
  
  return (
    <div className={cn(
      "relative group",
      selected && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg",
      dragging && "opacity-80 scale-105"
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
          "min-w-[180px] max-w-[220px] bg-card border-2 rounded-xl shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing",
          isStart ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50",
          selected && "border-primary",
          dragging && "shadow-2xl border-primary"
        )}
      >
        {/* Drag Handle Header */}
        <div 
          className="flex items-center justify-between px-3 py-2 border-b border-border/50 cursor-grab"
          onClick={(e) => {
            e.stopPropagation();
            data.onClick?.(data.segment);
          }}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50" />
            {isStart && <Flag className="h-3.5 w-3.5 text-primary" />}
            <span className="text-xs font-medium text-muted-foreground">
              {isStart ? 'Début' : `Étape ${data.index}`}
            </span>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        
        {/* Content */}
        <div className="p-3" onClick={() => data.onClick?.(data.segment)}>
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

// Inner component that uses ReactFlow hooks
const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({
  chain,
  onSegmentClick,
  onAddSegment,
  onSegmentsReorder,
}) => {
  const reactFlowInstance = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!chain.segments || chain.segments.length === 0) {
      const nodes: Node[] = onAddSegment ? [{
        id: 'add-first',
        type: 'addNode',
        position: { x: 200, y: 150 },
        data: { onClick: onAddSegment },
        draggable: false,
      }] : [];
      
      return { nodes, edges: [] };
    }

    const HORIZONTAL_SPACING = 280;
    const VERTICAL_OFFSET = 100;
    
    const nodes: Node[] = chain.segments.map((segment, index) => {
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
        draggable: true,
      };
    });

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
        draggable: false,
      });
    }

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

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Auto-layout function
  const handleAutoLayout = useCallback(() => {
    if (!chain.segments || chain.segments.length === 0) return;

    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 400;
    
    const nodeWidth = 200;
    const nodeHeight = 150;
    const padding = 50;
    
    const segmentCount = chain.segments.length;
    const addButtonCount = onAddSegment ? 1 : 0;
    const totalNodes = segmentCount + addButtonCount;
    
    // Calculate optimal spacing to fit all nodes
    const availableWidth = containerWidth - (padding * 2);
    const minSpacing = 250;
    const maxSpacing = 320;
    
    // Try to fit horizontally first
    let horizontalSpacing = Math.max(minSpacing, Math.min(maxSpacing, availableWidth / totalNodes));
    
    // Calculate how many rows we need
    const nodesPerRow = Math.max(1, Math.floor(availableWidth / horizontalSpacing));
    const rows = Math.ceil(totalNodes / nodesPerRow);
    
    // Adjust vertical spacing
    const verticalSpacing = rows > 1 ? Math.min(200, (containerHeight - padding * 2) / rows) : 0;
    
    // Reposition nodes in a grid/flow layout
    const newNodes = nodes.map((node, index) => {
      if (node.type === 'addNode') {
        // Position add button at the end
        const lastSegmentIndex = segmentCount - 1;
        const row = Math.floor(lastSegmentIndex / nodesPerRow);
        const col = (lastSegmentIndex % nodesPerRow) + 1;
        
        // Check if add button should be on next row
        const finalRow = col >= nodesPerRow ? row + 1 : row;
        const finalCol = col >= nodesPerRow ? 0 : col;
        
        return {
          ...node,
          position: {
            x: padding + (finalCol * horizontalSpacing) + nodeWidth / 2 - 20,
            y: padding + (finalRow * verticalSpacing) + nodeHeight / 2,
          },
        };
      }
      
      const segmentIndex = chain.segments!.findIndex(s => s.id === node.id);
      if (segmentIndex === -1) return node;
      
      const row = Math.floor(segmentIndex / nodesPerRow);
      const col = segmentIndex % nodesPerRow;
      
      return {
        ...node,
        position: {
          x: padding + (col * horizontalSpacing),
          y: padding + (row * verticalSpacing),
        },
        data: {
          ...node.data,
          index: segmentIndex + 1,
          isStart: segmentIndex === 0,
        },
      };
    });

    setNodes(newNodes);
    
    // Fit view after layout
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
    }, 50);
    
    toast.success('Layout optimisé');
  }, [chain.segments, nodes, setNodes, onAddSegment, reactFlowInstance]);

  // Handle drag end to reorder segments
  const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'addNode' || !onSegmentsReorder) return;
    
    // Get all workflow nodes sorted by x position
    const workflowNodes = nodes
      .filter(n => n.type === 'workflow')
      .sort((a, b) => a.position.x - b.position.x);
    
    // Extract segment IDs in new order
    const newOrder = workflowNodes.map(n => n.id);
    
    // Check if order changed
    const currentOrder = chain.segments?.map(s => s.id) || [];
    const orderChanged = newOrder.some((id, index) => currentOrder[index] !== id);
    
    if (orderChanged) {
      onSegmentsReorder(newOrder);
      
      // Update node indices
      setNodes(prevNodes => 
        prevNodes.map(n => {
          if (n.type !== 'workflow') return n;
          const newIndex = newOrder.indexOf(n.id);
          return {
            ...n,
            data: {
              ...n.data,
              index: newIndex + 1,
              isStart: newIndex === 0,
            },
          };
        })
      );
    }
  }, [nodes, chain.segments, onSegmentsReorder, setNodes]);

  if (!chain) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        Sélectionnez une chaîne de valeur
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-[400px] w-full rounded-xl overflow-hidden bg-muted/30 border border-border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
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
        <Panel position="top-right" className="flex gap-2">
          <Button
            variant="default"
            size="default"
            onClick={handleAutoLayout}
            className="shadow-lg font-semibold px-5 py-2.5 text-sm"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Réorganiser
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Wrapper component with ReactFlowProvider
export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
};