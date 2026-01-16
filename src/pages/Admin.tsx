import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HubPageLayout } from '@/components/hub/HubPageLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAssociation } from '@/hooks/useAssociation';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { format, addDays, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Calendar as CalendarIcon, GripVertical, AlertCircle, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

interface AdminTask {
  id: string;
  association_id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  template_key?: string;
  created_at: string;
}

const TASK_TEMPLATES = [
  { key: 'ag_annuelle', title: 'Assemblée Générale annuelle', description: 'Préparer et organiser l\'AG annuelle', daysFromNow: 60 },
  { key: 'cotisations', title: 'Renouvellement des cotisations', description: 'Envoyer les appels à cotisation aux membres', daysFromNow: 30 },
  { key: 'agrements', title: 'Renouvellement des agréments', description: 'Vérifier et renouveler les agréments nécessaires', daysFromNow: 90 },
];

const COLUMNS = [
  { id: 'todo', title: 'À faire', icon: Clock, color: 'text-yellow-500' },
  { id: 'in_progress', title: 'En cours', icon: AlertCircle, color: 'text-blue-500' },
  { id: 'done', title: 'Fait', icon: CheckCircle2, color: 'text-green-500' },
];

// Draggable Task Card
const TaskCard = ({ task, onEdit, onDelete }: { task: AdminTask; onEdit: () => void; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const daysUntilDue = task.due_date ? differenceInDays(new Date(task.due_date), new Date()) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow",
        isDragging && "opacity-50 shadow-lg"
      )}
      onClick={onEdit}
    >
      <div className="flex items-start gap-2">
        <div {...attributes} {...listeners} className="cursor-grab mt-1" onClick={(e) => e.stopPropagation()}>
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'} className="text-xs">
              {task.priority === 'high' ? 'Urgent' : task.priority === 'medium' ? 'Normal' : 'Bas'}
            </Badge>
            {daysUntilDue !== null && (
              <span className={cn(
                "text-xs",
                daysUntilDue < 0 ? "text-destructive" : daysUntilDue <= 7 ? "text-yellow-600" : "text-muted-foreground"
              )}>
                {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}j en retard` : daysUntilDue === 0 ? "Aujourd'hui" : `${daysUntilDue}j restants`}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

// Droppable Column
const Column = ({ id, title, icon: Icon, color, tasks, onEditTask, onDeleteTask }: {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  tasks: AdminTask[];
  onEditTask: (task: AdminTask) => void;
  onDeleteTask: (taskId: string) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 min-w-[280px] bg-muted/30 rounded-xl p-4 transition-colors",
        isOver && "bg-primary/10 ring-2 ring-primary/30"
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className={cn("h-5 w-5", color)} />
        <h3 className="font-semibold">{title}</h3>
        <Badge variant="outline" className="ml-auto">{tasks.length}</Badge>
      </div>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Aucune tâche
          </div>
        )}
      </div>
    </div>
  );
};

const Admin = () => {
  const { t } = useTranslation();
  const { isAdmin, loading: authLoading } = useAuth();
  const { currentAssociation } = useAssociation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<AdminTask | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: undefined as Date | undefined,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['admin-tasks', currentAssociation?.id],
    queryFn: async () => {
      if (!currentAssociation?.id) return [];
      const { data, error } = await supabase
        .from('admin_tasks')
        .select('*')
        .eq('association_id', currentAssociation.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AdminTask[];
    },
    enabled: !!currentAssociation?.id,
  });

  // Create/Update task mutation
  const saveMutation = useMutation({
    mutationFn: async (taskData: { title: string; description?: string; priority: string; due_date?: string | null }) => {
      if (editingTask) {
        const { error } = await supabase
          .from('admin_tasks')
          .update(taskData)
          .eq('id', editingTask.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('admin_tasks')
          .insert({
            ...taskData,
            association_id: currentAssociation?.id,
            status: 'todo'
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      toast.success(editingTask ? 'Tâche mise à jour' : 'Tâche créée');
      handleCloseForm();
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from('admin_tasks').delete().eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      toast.success('Tâche supprimée');
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const { error } = await supabase
        .from('admin_tasks')
        .update({ status })
        .eq('id', taskId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
    },
  });

  // Auto-create template tasks on first load
  useEffect(() => {
    const createTemplateTasks = async () => {
      if (!currentAssociation?.id || tasks.length > 0 || isLoading) return;
      
      const existingTemplateKeys = tasks.map(t => t.template_key).filter(Boolean);
      const missingTemplates = TASK_TEMPLATES.filter(t => !existingTemplateKeys.includes(t.key));
      
      for (const template of missingTemplates) {
        await supabase.from('admin_tasks').insert({
          association_id: currentAssociation.id,
          title: template.title,
          description: template.description,
          due_date: format(addDays(new Date(), template.daysFromNow), 'yyyy-MM-dd'),
          priority: 'medium',
          status: 'todo',
          template_key: template.key,
        });
      }
      
      if (missingTemplates.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      }
    };
    
    createTemplateTasks();
  }, [currentAssociation?.id, tasks.length, isLoading]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newStatus = over.id as string;
      if (['todo', 'in_progress', 'done'].includes(newStatus)) {
        updateStatusMutation.mutate({ taskId: active.id as string, status: newStatus });
      }
    }
  };

  const handleEditTask = (task: AdminTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date) : undefined,
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setFormData({ title: '', description: '', priority: 'medium', due_date: undefined });
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }
    saveMutation.mutate({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
    });
  };

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  const headerActions = (
    <Button onClick={() => setShowForm(true)}>
      <Plus className="h-4 w-4 mr-2" />
      Nouvelle tâche
    </Button>
  );

  return (
    <HubPageLayout
      title={t('nav.admin')}
      subtitle="Gérez vos tâches et échéances"
      loading={isLoading}
      headerActions={headerActions}
    >
      {/* Kanban Board */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              icon={col.icon}
              color={col.color}
              tasks={tasksByStatus[col.id as keyof typeof tasksByStatus]}
              onEditTask={handleEditTask}
              onDeleteTask={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      </DndContext>

      {/* Task Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Titre de la tâche"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Textarea
              placeholder="Description (optionnel)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Priorité</label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Normale</SelectItem>
                    <SelectItem value="high">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Échéance</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? format(formData.due_date, 'PPP', { locale: fr }) : 'Sélectionner'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.due_date}
                      onSelect={(date) => setFormData({ ...formData, due_date: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseForm}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              {editingTask ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HubPageLayout>
  );
};

export default Admin;
