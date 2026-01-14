import React, { useMemo, useCallback, useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
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
import { Building2, ChevronDown, Flag, Plus, LayoutGrid, GripVertical, Loader2, Save, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface WorkflowCanvasRef {
  savePositions: () => Promise<void>;
  hasUnsavedChanges: () => boolean;
}

export interface ViewportData {
  x: number;
  y: number;
  zoom: number;
}

interface WorkflowCanvasProps {
  chain: ValueChain;
  onSegmentClick?: (segment: ValueChainSegment) => void;
  onAddSegment?: () => void;
  onSegmentsReorder?: (segmentIds: string[]) => Promise<void>;
  onSavePositions?: (positions: Array<{ id: string; x: number; y: number; order: number }>, viewport?: ViewportData) => Promise<void>;
  onPaneClick?: () => void;
}

// Snap to grid settings
const GRID_SIZE = 20;
const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

// Custom Node Component - Larger and more readable
const WorkflowNode = ({ data, selected, dragging }: NodeProps) => {
  const isStart = data.isStart;
  const isHighlighted = data.isHighlighted;
  
  return (
    <div 
      className={cn(
        "relative group transition-all duration-300",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-xl",
        dragging && "opacity-90 scale-[1.02]",
        isHighlighted && "scale-[1.02] z-10"
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
            "!w-4 !h-4 !border-2 !border-background transition-all duration-300",
            isHighlighted ? "!bg-primary !scale-125" : "!bg-primary"
          )}
        />
      )}
      
      {/* Node Card - Larger size */}
      <div 
        className={cn(
          "min-w-[260px] max-w-[320px] bg-card border-2 rounded-xl shadow-lg transition-all duration-300 cursor-grab active:cursor-grabbing",
          isStart ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50",
          selected && "border-primary",
          dragging && "shadow-2xl border-primary",
          isHighlighted && "border-primary shadow-xl shadow-primary/20"
        )}
      >
        {/* Drag Handle Header */}
        <div 
          className="flex items-center justify-between px-4 py-3 border-b border-border/50 cursor-grab"
          onClick={(e) => {
            e.stopPropagation();
            data.onClick?.(data.segment);
          }}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
            {isStart && <Flag className="h-4 w-4 text-primary" />}
            <span className="text-sm font-medium text-muted-foreground">
              {isStart ? 'Début' : `Étape ${data.index}`}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {/* Content - Larger padding and text */}
        <div className="p-4" onClick={() => data.onClick?.(data.segment)}>
          <h4 className="font-semibold text-base text-foreground mb-3 line-clamp-2 leading-tight">
            {data.label}
          </h4>
          
          {/* Actors - Larger avatars and text */}
          <div className="space-y-2">
            {data.actors?.slice(0, 3).map((actor: any) => (
              <div key={actor.id} className="flex items-center gap-2.5">
                <Avatar className="h-7 w-7 border border-border">
                  <AvatarImage src={actor.photo} />
                  <AvatarFallback className="text-[10px] bg-primary/10">
                    {actor.firstName?.[0]}{actor.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground/80 truncate">
                  {actor.firstName} {actor.lastName}
                </span>
              </div>
            ))}
            
            {data.sections?.slice(0, 2).map((section: any) => (
              <div key={section.id} className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-foreground/80 truncate">
                  {section.title}
                </span>
              </div>
            ))}
            
            {data.actors?.length > 3 && (
              <span className="text-sm text-muted-foreground">
                +{data.actors.length - 3} autres
              </span>
            )}
            
            {(!data.actors?.length && !data.sections?.length) && (
              <span className="text-sm text-muted-foreground/60 italic">
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
          "!w-4 !h-4 !border-2 !border-background transition-all duration-300",
          isHighlighted ? "!bg-primary !scale-125" : "!bg-primary"
        )}
      />
      
      {/* Connection point decoration */}
      <div className={cn(
        "absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full transition-opacity",
        isHighlighted ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      )} />
    </div>
  );
};

// Add Node Button - Larger
const AddNodeButton = ({ data }: NodeProps) => {
  return (
    <button
      onClick={data.onClick}
      className="w-14 h-14 rounded-full bg-card border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all duration-200 group"
    >
      <Plus className="h-7 w-7 text-primary/60 group-hover:text-primary transition-colors" />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-4 !h-4 !bg-primary/40 !border-2 !border-background opacity-0"
      />
    </button>
  );
};

const nodeTypes = {
  workflow: WorkflowNode,
  addNode: AddNodeButton,
};

// Inner component that uses ReactFlow hooks
interface WorkflowCanvasInnerProps extends WorkflowCanvasProps {
  onDirtyChange?: (isDirty: boolean) => void;
  innerRef?: React.Ref<WorkflowCanvasRef>;
}

const WorkflowCanvasInner: React.FC<WorkflowCanvasInnerProps> = ({
  chain,
  onSegmentClick,
  onAddSegment,
  onSegmentsReorder,
  onSavePositions,
  onPaneClick,
  onDirtyChange,
  innerRef,
}) => {
  const reactFlowInstance = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [previousLayout, setPreviousLayout] = useState<{ nodes: Node[]; viewport: ViewportData } | null>(null);

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

    const HORIZONTAL_SPACING = 360;
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

  // Track if we have a saved viewport to restore
  const hasSavedViewport = chain.viewport_zoom && chain.viewport_zoom > 0;
  const viewportRestoredRef = useRef<string | null>(null);
  const initialViewportRef = useRef<ViewportData | null>(null);
  const isInitialLoadRef = useRef(true);
  
  // Restore saved viewport on chain load (with exact precision)
  // Only restore when chain ID changes (switching chains), not on data refresh
  useEffect(() => {
    if (hasSavedViewport && viewportRestoredRef.current !== chain.id) {
      // Mark as restored immediately to avoid race conditions
      viewportRestoredRef.current = chain.id;
      isInitialLoadRef.current = true;
      
      // Store the initial viewport for comparison
      initialViewportRef.current = {
        x: chain.viewport_x ?? 0,
        y: chain.viewport_y ?? 0,
        zoom: chain.viewport_zoom ?? 1,
      };
      
      // Use requestAnimationFrame for precise timing after render
      requestAnimationFrame(() => {
        reactFlowInstance.setViewport({
          x: chain.viewport_x ?? 0,
          y: chain.viewport_y ?? 0,
          zoom: chain.viewport_zoom ?? 1,
        }, { duration: 0 }); // No animation for exact positioning
        
        // Mark initial load as complete after a short delay
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 500);
      });
    } else if (!hasSavedViewport && viewportRestoredRef.current !== chain.id) {
      viewportRestoredRef.current = chain.id;
      isInitialLoadRef.current = true;
      initialViewportRef.current = null;
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 500);
    }
  }, [chain.id]); // Only depend on chain.id, not on viewport values

  // Handle viewport changes (pan/zoom) to mark as dirty
  const handleMoveEnd = useCallback(() => {
    // Skip during initial load
    if (isInitialLoadRef.current) return;
    
    const currentViewport = reactFlowInstance.getViewport();
    const initial = initialViewportRef.current;
    
    // Check if viewport has changed significantly from initial
    if (initial) {
      const hasChanged = 
        Math.abs(currentViewport.x - initial.x) > 1 ||
        Math.abs(currentViewport.y - initial.y) > 1 ||
        Math.abs(currentViewport.zoom - initial.zoom) > 0.01;
      
      if (hasChanged && !isDirty) {
        setIsDirty(true);
      }
    } else if (!isDirty) {
      // No initial viewport saved, any move should allow saving
      setIsDirty(true);
    }
  }, [reactFlowInstance, isDirty]);

  // Update add-new node position when workflow nodes change
  const workflowNodesKey = useMemo(() => {
    return nodes
      .filter(n => n.type === 'workflow')
      .map(n => `${n.id}:${Math.round(n.position.x)}:${Math.round(n.position.y)}`)
      .join(',');
  }, [nodes]);

  useEffect(() => {
    const workflowNodes = nodes.filter(n => n.type === 'workflow');
    if (workflowNodes.length === 0 || !onAddSegment) return;

    const addNewNode = nodes.find(n => n.id === 'add-new');
    if (!addNewNode) return;

    // Find the last workflow node by position (bottom-right)
    const lastNode = workflowNodes.reduce((last, current) => {
      if (current.position.y > last.position.y) return current;
      if (current.position.y === last.position.y && current.position.x > last.position.x) return current;
      return last;
    }, workflowNodes[0]);

    const newX = lastNode.position.x + 360;
    const newY = lastNode.position.y;

    // Only update if position actually changed
    if (Math.abs(addNewNode.position.x - newX) > 1 || Math.abs(addNewNode.position.y - newY) > 1) {
      setNodes(prevNodes => prevNodes.map(n => {
        if (n.id === 'add-new') {
          return {
            ...n,
            position: { x: newX, y: newY },
          };
        }
        return n;
      }));
    }
  }, [workflowNodesKey, onAddSegment]);

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

  // Notify parent when dirty state changes
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Save positions function
  const savePositions = useCallback(async () => {
    if (!isDirty || !onSavePositions) return;
    
    setIsSaving(true);
    
    const workflowNodes = nodes
      .filter(n => n.type === 'workflow')
      .sort((a, b) => {
        const rowA = Math.floor(a.position.y / 200);
        const rowB = Math.floor(b.position.y / 200);
        if (rowA !== rowB) return rowA - rowB;
        return a.position.x - b.position.x;
      });
    
    const positionsToSave = workflowNodes.map((n, index) => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
      order: index,
    }));
    
    // Get current viewport (camera position)
    const viewport = reactFlowInstance.getViewport();
    const viewportData: ViewportData = {
      x: viewport.x,
      y: viewport.y,
      zoom: viewport.zoom,
    };
    
    try {
      await onSavePositions(positionsToSave, viewportData);
      setIsDirty(false);
      toast.success('Positions sauvegardées');
    } catch (error) {
      console.error('Error saving positions:', error);
      toast.error('Erreur lors de la sauvegarde des positions');
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, nodes, onSavePositions, reactFlowInstance]);

  // Expose ref methods
  useImperativeHandle(innerRef, () => ({
    savePositions,
    hasUnsavedChanges: () => isDirty,
  }), [savePositions, isDirty]);

  // Undo layout function - restore previous positions
  const handleUndoLayout = useCallback(() => {
    if (!previousLayout) return;
    
    setNodes(previousLayout.nodes);
    reactFlowInstance.setViewport(previousLayout.viewport, { duration: 300 });
    setPreviousLayout(null);
    setIsDirty(true);
    toast.info('Layout précédent restauré');
  }, [previousLayout, setNodes, reactFlowInstance]);

  // Auto-layout function - compact, readable, full width with close camera
  const handleAutoLayout = useCallback(() => {
    if (!chain.segments || chain.segments.length === 0) return;
    if (!onSavePositions) {
      toast.error("Vous n'avez pas les droits pour réorganiser");
      return;
    }

    // Save current layout for undo
    const currentViewport = reactFlowInstance.getViewport();
    setPreviousLayout({
      nodes: nodes.map(n => ({ ...n })),
      viewport: { x: currentViewport.x, y: currentViewport.y, zoom: currentViewport.zoom },
    });

    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 500;
    
    // Card dimensions - keep them readable
    const nodeWidth = 280;
    const nodeHeight = 180;
    const horizontalGap = 60; // Compact gap
    const verticalGap = 50; // Compact gap
    const padding = 40; // Smaller padding for full width usage
    
    const segmentCount = chain.segments.length;
    
    // Calculate optimal nodes per row to fill width
    const availableWidth = containerWidth - (padding * 2);
    const nodeWithGap = nodeWidth + horizontalGap;
    
    // Try to fit as many as possible while keeping readable
    let nodesPerRow = Math.max(1, Math.floor(availableWidth / nodeWithGap));
    
    // If we have fewer segments than can fit in a row, center them
    if (segmentCount <= nodesPerRow) {
      nodesPerRow = segmentCount;
    }
    
    // Calculate total rows needed
    const totalRows = Math.ceil(segmentCount / nodesPerRow);
    
    // Calculate actual used width and height
    const actualWidth = nodesPerRow * nodeWidth + (nodesPerRow - 1) * horizontalGap;
    const actualHeight = totalRows * nodeHeight + (totalRows - 1) * verticalGap;
    
    // Center horizontally
    const startX = (containerWidth - actualWidth) / 2;
    const startY = padding;
    
    const newNodes = nodes.map((node) => {
      if (node.type === 'addNode') {
        // Position add button after the last segment
        const lastSegmentIndex = segmentCount - 1;
        const row = Math.floor(lastSegmentIndex / nodesPerRow);
        const col = lastSegmentIndex % nodesPerRow;
        
        // If room on same row, put it there
        const isRoomOnRow = col < nodesPerRow - 1;
        const finalRow = isRoomOnRow ? row : row + 1;
        const finalCol = isRoomOnRow ? col + 1 : 0;
        
        return {
          ...node,
          position: {
            x: startX + (finalCol * (nodeWidth + horizontalGap)) + nodeWidth / 2 - 28,
            y: startY + (finalRow * (nodeHeight + verticalGap)) + nodeHeight / 2 - 28,
          },
        };
      }
      
      const segmentIndex = chain.segments!.findIndex(s => s.id === node.id);
      if (segmentIndex === -1) return node;
      
      const row = Math.floor(segmentIndex / nodesPerRow);
      const col = segmentIndex % nodesPerRow;
      
      // Snap to grid
      const newX = snapToGrid(startX + (col * (nodeWidth + horizontalGap)));
      const newY = snapToGrid(startY + (row * (nodeHeight + verticalGap)));
      
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
    setIsDirty(true);
    
    // Calculate optimal zoom to fit content while keeping cards readable
    // We want zoom to be between 0.8 and 1.2 for readability
    const widthRatio = (containerWidth - 40) / (actualWidth + 80);
    const heightRatio = (containerHeight - 40) / (actualHeight + 80);
    const optimalZoom = Math.min(widthRatio, heightRatio, 1.2);
    const finalZoom = Math.max(0.7, Math.min(optimalZoom, 1.2));
    
    // Calculate center position for viewport
    const centerX = startX + actualWidth / 2;
    const centerY = startY + actualHeight / 2;
    
    // Set viewport to center content with optimal zoom
    setTimeout(() => {
      const viewportX = (containerWidth / 2) - (centerX * finalZoom);
      const viewportY = (containerHeight / 2) - (centerY * finalZoom);
      
      reactFlowInstance.setViewport({
        x: viewportX,
        y: viewportY,
        zoom: finalZoom,
      }, { duration: 400 });
    }, 100);
    
    toast.info('Layout réorganisé - N\'oubliez pas de sauvegarder');
  }, [chain.segments, nodes, setNodes, onAddSegment, reactFlowInstance, onSavePositions]);

  // Handle drag end - snap to grid and mark as dirty
  const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'addNode' || !onSavePositions) return;
    
    // Snap position to grid
    const snappedX = snapToGrid(node.position.x);
    const snappedY = snapToGrid(node.position.y);
    
    // Update the node with snapped position
    setNodes(prevNodes => 
      prevNodes.map(n => {
        if (n.id === node.id) {
          return {
            ...n,
            position: { x: snappedX, y: snappedY },
          };
        }
        return n;
      })
    );
    
    // Get all workflow nodes sorted by position (after snapping)
    setTimeout(() => {
      const workflowNodes = nodes
        .filter(n => n.type === 'workflow')
        .map(n => n.id === node.id ? { ...n, position: { x: snappedX, y: snappedY } } : n)
        .sort((a, b) => {
          const rowA = Math.floor(a.position.y / 200);
          const rowB = Math.floor(b.position.y / 200);
          if (rowA !== rowB) return rowA - rowB;
          return a.position.x - b.position.x;
        });
      
      // Update node indices for visual feedback
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
    }, 0);
    
    setIsDirty(true);
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
      {isSaving && (
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
        onMoveEnd={handleMoveEnd}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView={!hasSavedViewport}
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        snapToGrid={true}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        className="transition-all duration-300"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={GRID_SIZE} 
          size={1.5}
          color="hsl(var(--muted-foreground) / 0.2)"
        />
        <Controls 
          showInteractive={false}
          className="!bg-card !border-border !shadow-md"
        />
        <Panel position="top-right" className="flex gap-2">
          {isDirty && onSavePositions && (
            <Button
              variant="default"
              size="default"
              onClick={savePositions}
              disabled={isSaving}
              className="shadow-lg font-semibold px-5 py-2.5 text-sm bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Sauvegarder
            </Button>
          )}
          {previousLayout && (
            <Button
              variant="outline"
              size="default"
              onClick={handleUndoLayout}
              disabled={isSaving}
              className="shadow-lg font-semibold px-4 py-2.5 text-sm"
            >
              <Undo2 className="h-4 w-4 mr-2" />
              Annuler
            </Button>
          )}
          <Button
            variant={isDirty ? "outline" : "default"}
            size="default"
            onClick={handleAutoLayout}
            disabled={isSaving}
            className="shadow-lg font-semibold px-5 py-2.5 text-sm"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Réorganiser
          </Button>
        </Panel>
      </ReactFlow>
      
      {/* Dirty indicator */}
      {isDirty && (
        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-orange-500/90 text-white text-xs font-medium rounded-full shadow-lg">
          Modifications non sauvegardées
        </div>
      )}
    </div>
  );
};

// Wrapper component with ReactFlowProvider
interface WorkflowCanvasWrapperProps extends WorkflowCanvasProps {
  canvasRef?: React.Ref<WorkflowCanvasRef>;
}

export const WorkflowCanvas = forwardRef<WorkflowCanvasRef, WorkflowCanvasProps>((props, ref) => {
  const [isDirty, setIsDirty] = useState(false);
  const innerRef = useRef<WorkflowCanvasRef>(null);

  // Forward ref methods
  useImperativeHandle(ref, () => ({
    savePositions: async () => {
      await innerRef.current?.savePositions();
    },
    hasUnsavedChanges: () => innerRef.current?.hasUnsavedChanges() ?? false,
  }), []);

  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner 
        {...props} 
        innerRef={innerRef}
        onDirtyChange={setIsDirty}
      />
    </ReactFlowProvider>
  );
});
