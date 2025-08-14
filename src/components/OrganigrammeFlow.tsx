import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Background,
  Controls,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Section, Person } from '../types/organigramme';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { PersonCard } from './PersonCard';

interface OrganigrammeFlowProps {
  sections: Section[];
  people: Person[];
  onSectionsReorder: (sections: Section[]) => void;
  onPersonClick: (person: Person) => void;
  onEditPerson: (person: Person) => void;
}

// Custom node component for sections
const SectionNode = ({ data }: { data: any }) => {
  const { section, onPersonClick, onEditPerson } = data;
  
  return (
    <Card className="section-card p-4 min-w-80 bg-background/95 backdrop-blur">
      <div className="section-header mb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-foreground">{section.title}</h3>
          <Badge variant="secondary" className="text-xs">
            {section.members.length} membre{section.members.length > 1 ? 's' : ''}
          </Badge>
        </div>
        
        {section.leader && (
          <div className="text-xs text-muted-foreground mt-1">
            Responsable : {section.leader}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {section.members.map(member => (
          <PersonCard
            key={member.id}
            person={member}
            onClick={onPersonClick}
            isAdmin={true}
            onEdit={onEditPerson}
            compact={true}
          />
        ))}
      </div>

      {section.subsections && section.subsections.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <h4 className="text-sm font-medium mb-2">Sous-groupes :</h4>
          <div className="space-y-2">
            {section.subsections.map(subsection => (
              <div key={subsection.id} className="pl-4 border-l-2 border-accent/30">
                <div className="text-sm font-medium">{subsection.title}</div>
                <div className="space-y-1 mt-1">
                  {subsection.members.map(member => (
                    <PersonCard
                      key={member.id}
                      person={member}
                      onClick={onPersonClick}
                      isAdmin={true}
                      onEdit={onEditPerson}
                      compact={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

const nodeTypes = {
  section: SectionNode,
};

export const OrganigrammeFlow: React.FC<OrganigrammeFlowProps> = ({
  sections,
  people,
  onSectionsReorder,
  onPersonClick,
  onEditPerson,
}) => {
  // Convert sections to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return sections.map((section, index) => ({
      id: section.id,
      type: 'section',
      position: { 
        x: (index % 2) * 400, 
        y: Math.floor(index / 2) * 300 
      },
      data: {
        section,
        onPersonClick,
        onEditPerson,
      },
      draggable: true,
    }));
  }, [sections, onPersonClick, onEditPerson]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  // Handle node changes and update section order
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    
    // If there are position changes, we might want to reorder sections
    const positionChanges = changes.filter(change => change.type === 'position');
    if (positionChanges.length > 0) {
      // Sort nodes by their Y position, then X position
      const sortedNodes = [...nodes].sort((a, b) => {
        if (Math.abs(a.position.y - b.position.y) < 50) {
          return a.position.x - b.position.x;
        }
        return a.position.y - b.position.y;
      });

      // Reorder sections based on node positions
      const reorderedSections = sortedNodes.map(node => 
        sections.find(section => section.id === node.id)
      ).filter(Boolean) as Section[];

      if (reorderedSections.length === sections.length) {
        onSectionsReorder(reorderedSections);
      }
    }
  }, [nodes, sections, onSectionsReorder, onNodesChange]);

  return (
    <div className="h-96 border border-border rounded-lg bg-muted/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="top-right"
        className="bg-background"
      >
        <Background />
        <Controls />
      </ReactFlow>
      
      <div className="p-2 bg-muted/50 text-xs text-muted-foreground text-center border-t">
        Glissez-déposez les sections pour réorganiser l'ordre
      </div>
    </div>
  );
};