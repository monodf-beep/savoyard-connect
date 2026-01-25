import React from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';
import { Project } from '@/pages/Projects';

interface ProjectsKanbanProps {
  projects: Project[];
  onStatusChange: (projectId: string, newStatus: 'planned' | 'in_progress' | 'completed') => void;
  onProjectClick: (project: Project) => void;
  isAdmin: boolean;
}

const statusConfig = {
  planned: {
    label: 'Planifiés',
    color: 'bg-muted border-border',
    headerColor: 'bg-muted/50',
    badgeColor: 'bg-muted text-muted-foreground',
  },
  in_progress: {
    label: 'En cours',
    color: 'bg-primary/5 border-primary/20',
    headerColor: 'bg-primary/10',
    badgeColor: 'bg-primary/10 text-primary',
  },
  completed: {
    label: 'Terminés',
    color: 'bg-secondary/5 border-secondary/20',
    headerColor: 'bg-secondary/10',
    badgeColor: 'bg-secondary/10 text-secondary',
  },
};

// Droppable Column
const KanbanColumn = ({ 
  status, 
  projects, 
  onProjectClick,
  isAdmin,
}: { 
  status: 'planned' | 'in_progress' | 'completed';
  projects: Project[];
  onProjectClick: (project: Project) => void;
  isAdmin: boolean;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const config = statusConfig[status];

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border-2 border-dashed min-h-[400px] transition-all",
        config.color,
        isOver && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <div className={cn("p-3 rounded-t-lg", config.headerColor)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{config.label}</h3>
          <Badge variant="secondary" className="text-xs">
            {projects.length}
          </Badge>
        </div>
      </div>

      <div className="flex-1 p-2 space-y-2">
        <SortableContext 
          items={projects.map(p => p.id)} 
          strategy={verticalListSortingStrategy}
        >
          {projects.map((project) => (
            <SortableProjectCard
              key={project.id}
              project={project}
              onClick={() => onProjectClick(project)}
              isAdmin={isAdmin}
            />
          ))}
        </SortableContext>

        {projects.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Glissez un projet ici
          </div>
        )}
      </div>
    </div>
  );
};

// Sortable Project Card
const SortableProjectCard = ({ 
  project, 
  onClick,
  isAdmin,
}: { 
  project: Project;
  onClick: () => void;
  isAdmin: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: project.id,
    disabled: !isAdmin,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <KanbanProjectCard 
        project={project} 
        onClick={onClick}
        dragHandleProps={isAdmin ? { ...attributes, ...listeners } : undefined}
        isAdmin={isAdmin}
      />
    </div>
  );
};

// Project Card for Kanban
const KanbanProjectCard = ({ 
  project, 
  onClick,
  dragHandleProps,
  isAdmin,
}: { 
  project: Project;
  onClick: () => void;
  dragHandleProps?: any;
  isAdmin: boolean;
}) => {
  const totalFunded = (project.ha_net_total || 0) + (project.manual_cash_total || 0);
  const fundingGoal = project.funding_goal || 0;
  const progress = fundingGoal > 0 ? Math.min((totalFunded / fundingGoal) * 100, 100) : 0;

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-all group relative",
        project.approval_status === 'pending' && "border-orange-500/30"
      )}
      onClick={onClick}
    >
      {isAdmin && (
        <div 
          {...dragHandleProps}
          className="absolute left-1 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      
      <CardContent className={cn("p-3", isAdmin && "pl-6")}>
        <h4 className="font-medium text-sm line-clamp-2 mb-1">{project.title}</h4>
        
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {project.description}
          </p>
        )}

        {project.approval_status === 'pending' && (
          <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-600 border-orange-500/30 mb-2">
            En attente
          </Badge>
        )}

        {project.is_funding_project && fundingGoal > 0 && (
          <div className="mt-2">
            <div className="flex items-baseline justify-between text-xs mb-1">
              <span className="font-medium text-primary">
                {totalFunded.toLocaleString('fr-FR')} €
              </span>
              <span className="text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Drag Overlay Card (displayed while dragging)
const DragOverlayCard = ({ project }: { project: Project }) => {
  return (
    <Card className="shadow-xl rotate-3 cursor-grabbing">
      <CardContent className="p-3">
        <h4 className="font-medium text-sm">{project.title}</h4>
      </CardContent>
    </Card>
  );
};

export const ProjectsKanban = ({ 
  projects, 
  onStatusChange, 
  onProjectClick,
  isAdmin,
}: ProjectsKanbanProps) => {
  const [activeProject, setActiveProject] = React.useState<Project | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const plannedProjects = projects.filter(p => p.status === 'planned');
  const inProgressProjects = projects.filter(p => p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const project = projects.find(p => p.id === active.id);
    setActiveProject(project || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id as string;
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Check if dropped on a column
    const overId = over.id as string;
    const newStatus = ['planned', 'in_progress', 'completed'].includes(overId) 
      ? overId as 'planned' | 'in_progress' | 'completed'
      : null;

    if (newStatus && newStatus !== project.status) {
      onStatusChange(projectId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KanbanColumn
          status="planned"
          projects={plannedProjects}
          onProjectClick={onProjectClick}
          isAdmin={isAdmin}
        />
        <KanbanColumn
          status="in_progress"
          projects={inProgressProjects}
          onProjectClick={onProjectClick}
          isAdmin={isAdmin}
        />
        <KanbanColumn
          status="completed"
          projects={completedProjects}
          onProjectClick={onProjectClick}
          isAdmin={isAdmin}
        />
      </div>

      <DragOverlay>
        {activeProject ? <DragOverlayCard project={activeProject} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
