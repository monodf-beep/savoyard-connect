import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
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
import { Building2, ChevronDown, Flag, Plus, LayoutGrid, GripVertical, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WorkflowCanvasProps {
  chain: ValueChain;
  onSegmentClick?: (segment: ValueChainSegment) => void;
  onAddSegment?: () => void;
  onSegmentsReorder?: (segmentIds: string[]) => Promise<void>;
  onSavePositions?: (positions: Array<{ id: string; x: number; y: number; order: number }>) => Promise<void>;
}

// Custom Node Component
const WorkflowNode = ({ data, selected, dragging }: NodeProps) => {
  const isStart = data.isStart;
  const isHighlighted = data.isHighlighted;
  
  return (
    <div 
      className={cn(
        "relative group transition-all duration-300",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-lg",
        dragging && "opacity-80 scale-105",
        isHighlighted && "scale-105 z-10"
      )}
      onMouseEnter={() => data.onHover?.(data.segment?.id, true)}
      onMouseLeave={() => data.onHover?.(data.segment?.id, false)}
    >
      {/* Input Handle */}
      {!isStart && (
        <Handle
          type="target"
          position={Position.Left}
          className={cn(
            "!w-3 !h-3 !border-2 !border-background transition-all duration-300",
            isHighlighted ? "!bg-primary !scale-125" : "!bg-primary"
          )}
        />
      )}
      
      {/* Node Card */}
      <div 
        className={cn(
          "min-w-[180px] max-w-[220px] bg-card border-2 rounded-xl shadow-lg transition-all duration-300 cursor-grab active:cursor-grabbing",
          isStart ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50",
          selected && "border-primary",
          dragging && "shadow-2xl border-primary",
          isHighlighted && "border-primary shadow-xl shadow-primary/20"
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
        className={cn(
          "!w-3 !h-3 !border-2 !border-background transition-all duration-300",
          isHighlighted ? "!bg-primary !scale-125" : "!bg-primary"
        )}
      />
      
      {/* Connection point decoration */}
      <div className={cn(
        "absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full transition-opacity",
        isHighlighted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )} />
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
  onSavePositions,
}) => {
  const reactFlowInstance = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReorganizing, setIsReorganizing] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Handle node hover for edge highlighting
  const handleNodeHover = useCallback((nodeId: string | undefined, isHovering: boolean) => {
    setHoveredNodeId(isHovering && nodeId ? nodeId : null);
  }, []);

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
      // Use saved positions if available, otherwise calculate default positions
      const hasSavedPosition = segment.position_x != null && segment.position_y != null;
      const yOffset = Math.sin(index * 0.8) * 30;
      
      return {
        id: segment.id,
        type: 'workflow',
        position: hasSavedPosition 
          ? { x: segment.position_x!, y: segment.position_y! }
          : { x: 100 + (index * HORIZONTAL_SPACING), y: VERTICAL_OFFSET + yOffset },
        data: {
          label: segment.function_name,
          actors: segment.actors || [],
          sections: segment.sections || [],
          segment,
          index: index + 1,
          isStart: index === 0,
          onClick: onSegmentClick,
          onHover: handleNodeHover,
          isHighlighted: false,
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
          transition: 'all 0.3s ease',
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
  }, [chain, onSegmentClick, onAddSegment, handleNodeHover]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Update edges and nodes based on hover state
  useEffect(() => {
    if (!hoveredNodeId) {
      // Reset all edges and nodes to normal
      setEdges(prevEdges => prevEdges.map(edge => ({
        ...edge,
        animated: edge.id.includes('add-new'),
        style: {
          ...edge.style,
          stroke: edge.id.includes('add-new') ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--primary))',
          strokeWidth: edge.id.includes('add-new') ? 2 : 3,
        },
      })));
      setNodes(prevNodes => prevNodes.map(node => ({
        ...node,
        data: { ...node.data, isHighlighted: false },
      })));
      return;
    }

    // Highlight connected edges
    setEdges(prevEdges => prevEdges.map(edge => {
      const isConnected = edge.source === hoveredNodeId || edge.target === hoveredNodeId;
      if (edge.id.includes('add-new')) return edge;
      
      return {
        ...edge,
        animated: isConnected,
        style: {
          ...edge.style,
          stroke: isConnected ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)',
          strokeWidth: isConnected ? 4 : 2,
        },
      };
    }));

    // Highlight connected nodes
    const connectedNodeIds = new Set<string>();
    connectedNodeIds.add(hoveredNodeId);
    edges.forEach(edge => {
      if (edge.source === hoveredNodeId) connectedNodeIds.add(edge.target);
      if (edge.target === hoveredNodeId) connectedNodeIds.add(edge.source);
    });

    setNodes(prevNodes => prevNodes.map(node => ({
      ...node,
      data: { 
        ...node.data, 
        isHighlighted: connectedNodeIds.has(node.id),
        onHover: handleNodeHover,
      },
    })));
  }, [hoveredNodeId, edges, setEdges, setNodes, handleNodeHover]);

  // Auto-layout function with animation and save
  const handleAutoLayout = useCallback(async () => {
    if (!chain.segments || chain.segments.length === 0) return;
    if (!onSavePositions) {
      toast.error("Vous n'avez pas les droits pour réorganiser");
      return;
    }

    setIsReorganizing(true);

    const containerWidth = containerRef.current?.clientWidth || 800;
    
    const nodeWidth = 220;
    const nodeHeight = 180;
    const horizontalGap = 100;
    const verticalGap = 80;
    const padding = 80;
    
    const segmentCount = chain.segments.length;
    
    const availableWidth = containerWidth - (padding * 2);
    const nodeWithGap = nodeWidth + horizontalGap;
    const nodesPerRow = Math.max(1, Math.floor(availableWidth / nodeWithGap));
    
    // Calculate new positions
    const positionsToSave: Array<{ id: string; x: number; y: number; order: number }> = [];
    
    const newNodes = nodes.map((node) => {
      if (node.type === 'addNode') {
        const lastSegmentIndex = segmentCount - 1;
        const row = Math.floor(lastSegmentIndex / nodesPerRow);
        const col = (lastSegmentIndex % nodesPerRow) + 1;
        const finalRow = col >= nodesPerRow ? row + 1 : row;
        const finalCol = col >= nodesPerRow ? 0 : col;
        
        return {
          ...node,
          position: {
            x: padding + (finalCol * nodeWithGap) + nodeWidth / 2 - 20,
            y: padding + (finalRow * (nodeHeight + verticalGap)) + nodeHeight / 2,
          },
        };
      }
      
      const segmentIndex = chain.segments!.findIndex(s => s.id === node.id);
      if (segmentIndex === -1) return node;
      
      const row = Math.floor(segmentIndex / nodesPerRow);
      const col = segmentIndex % nodesPerRow;
      
      const newX = padding + (col * nodeWithGap);
      const newY = padding + (row * (nodeHeight + verticalGap));
      
      positionsToSave.push({
        id: node.id,
        x: newX,
        y: newY,
        order: segmentIndex,
      });
      
      return {
        ...node,
        position: { x: newX, y: newY },
        data: {
          ...node.data,
          index: segmentIndex + 1,
          isStart: segmentIndex === 0,
        },
      };
    });

    setNodes(newNodes);
    
    // Fit view with animation
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
    }, 100);

    // Save positions to database
    try {
      await onSavePositions(positionsToSave);
      toast.success('Layout optimisé et sauvegardé');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsReorganizing(false);
    }
  }, [chain.segments, nodes, setNodes, onAddSegment, reactFlowInstance, onSavePositions]);

  // Handle drag end to save positions to database
  const handleNodeDragStop = useCallback(async (event: React.MouseEvent, node: Node) => {
    if (node.type === 'addNode' || !onSavePositions) return;
    
    setIsReorganizing(true);
    
    // Get all workflow nodes sorted by x position, then by y for same row
    const workflowNodes = nodes
      .filter(n => n.type === 'workflow')
      .sort((a, b) => {
        const rowA = Math.floor(a.position.y / 200);
        const rowB = Math.floor(b.position.y / 200);
        if (rowA !== rowB) return rowA - rowB;
        return a.position.x - b.position.x;
      });
    
    // Build positions array with order based on visual position
    const positionsToSave = workflowNodes.map((n, index) => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
      order: index,
    }));
    
    // Update node indices immediately for visual feedback
    setNodes(prevNodes => 
      prevNodes.map(n => {
        if (n.type !== 'workflow') return n;
        const newIndex = workflowNodes.findIndex(wn => wn.id === n.id);
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
    
    // Save to database
    try {
      await onSavePositions(positionsToSave);
      toast.success('Positions sauvegardées');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsReorganizing(false);
    }
  }, [nodes, onSavePositions, setNodes]);

  if (!chain) {
    return (
      <div className="h-[500px] flex items-center justify-center text-muted-foreground">
        Sélectionnez une chaîne de valeur
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-[500px] w-full rounded-xl overflow-hidden bg-muted/30 border border-border relative">
      {/* Loading overlay */}
      {isReorganizing && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center gap-3 bg-card px-4 py-3 rounded-lg shadow-lg border border-border">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Sauvegarde en cours...</span>
          </div>
        </div>
      )}
      
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
        className="transition-all duration-300"
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
            disabled={isReorganizing}
            className="shadow-lg font-semibold px-5 py-2.5 text-sm"
          >
            {isReorganizing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <LayoutGrid className="h-4 w-4 mr-2" />
            )}
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
