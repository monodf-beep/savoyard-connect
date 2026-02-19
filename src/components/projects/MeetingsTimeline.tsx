import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronDown, Users, FolderOpen, Calendar, X, Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Meeting } from '@/hooks/useMeetings';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MeetingsTimelineProps {
  meetings: Meeting[];
  isLoading: boolean;
  activeMeetingId: string | null;
  onFilterByMeeting: (meetingId: string | null) => void;
  isAdmin: boolean;
  onMeetingCreated: () => void;
}

export const MeetingsTimeline = ({
  meetings,
  isLoading,
  activeMeetingId,
  onFilterByMeeting,
  isAdmin,
  onMeetingCreated,
}: MeetingsTimelineProps) => {
  const [open, setOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [description, setDescription] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [sections, setSections] = useState<Array<{ id: string; title: string }>>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSections = async () => {
      const { data } = await supabase
        .from('sections')
        .select('id, title')
        .order('title');
      if (data) setSections(data);
    };
    fetchSections();
  }, []);

  if (isLoading) return null;

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ title: 'Titre requis', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const startDateTime = startDate && startTime
        ? new Date(`${startDate}T${startTime}`).toISOString()
        : startDate
          ? new Date(`${startDate}T09:00`).toISOString()
          : new Date().toISOString();

      const { error } = await supabase.from('meetings').insert({
        title: title.trim(),
        start_time: startDateTime,
        ai_summary: description.trim() || null,
      });

      if (error) throw error;

      toast({ title: 'RDV ajouté' });
      setTitle('');
      setStartDate('');
      setStartTime('');
      setDescription('');
      setSectionId('');
      setShowForm(false);
      onMeetingCreated();
    } catch (e: any) {
      toast({ title: 'Erreur', description: e.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  // Split meetings into upcoming and past
  const now = new Date();
  const upcoming = meetings.filter(m => {
    const d = m.start_time ? new Date(m.start_time) : new Date(m.created_at);
    return d >= now;
  }).sort((a, b) => {
    const da = a.start_time ? new Date(a.start_time) : new Date(a.created_at);
    const db = b.start_time ? new Date(b.start_time) : new Date(b.created_at);
    return da.getTime() - db.getTime();
  });

  const past = meetings.filter(m => {
    const d = m.start_time ? new Date(m.start_time) : new Date(m.created_at);
    return d < now;
  });

  return (
    <div className="mb-6">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="rounded-xl border bg-card">
          <div className="flex items-center">
            <CollapsibleTrigger className="flex items-center gap-2 flex-1 p-4 rounded-l-xl hover:bg-muted/50 active:bg-muted transition-all duration-200">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-semibold">Calendrier</span>
              {meetings.length > 0 && (
                <Badge variant="secondary" className="ml-1">{meetings.length}</Badge>
              )}
              {upcoming.length > 0 && (
                <Badge variant="default" className="ml-1 text-xs">
                  {upcoming.length} à venir
                </Badge>
              )}
              {activeMeetingId && (
                <Badge variant="outline" className="ml-1 text-xs">Filtre actif</Badge>
              )}
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground ml-auto transition-transform",
                open && "rotate-180"
              )} />
            </CollapsibleTrigger>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="mr-3 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200"
                onClick={(e) => { e.stopPropagation(); setShowForm(true); }}
              >
                <Plus className="h-4 w-4 mr-1" />
                RDV
              </Button>
            )}
          </div>

          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-3">
              {activeMeetingId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFilterByMeeting(null)}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Afficher tous les projets
                </Button>
              )}

              {meetings.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Aucun RDV. {isAdmin ? 'Ajoutez un RDV ou importez une transcription.' : ''}
                </p>
              )}

              {/* Upcoming meetings */}
              {upcoming.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">À venir</p>
                  {upcoming.map((meeting) => (
                    <MeetingRow
                      key={meeting.id}
                      meeting={meeting}
                      activeMeetingId={activeMeetingId}
                      onFilterByMeeting={onFilterByMeeting}
                      isUpcoming
                    />
                  ))}
                </div>
              )}

              {/* Past meetings */}
              {past.length > 0 && (
                <div className="space-y-2">
                  {upcoming.length > 0 && (
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2">Passées</p>
                  )}
                  {past.map((meeting) => (
                    <MeetingRow
                      key={meeting.id}
                      meeting={meeting}
                      activeMeetingId={activeMeetingId}
                      onFilterByMeeting={onFilterByMeeting}
                    />
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Create meeting dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau RDV / Réunion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Ex: Réunion Commission Sport"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Select value={sectionId} onValueChange={setSectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Commission (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1"
              />
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-28"
              />
            </div>
            <Textarea
              placeholder="Description ou ordre du jour (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
            <Button onClick={handleCreate} disabled={isSaving} className="w-full">
              {isSaving ? 'Création...' : 'Ajouter le RDV'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sub-component for a single meeting row
const MeetingRow = ({
  meeting,
  activeMeetingId,
  onFilterByMeeting,
  isUpcoming,
}: {
  meeting: Meeting;
  activeMeetingId: string | null;
  onFilterByMeeting: (id: string | null) => void;
  isUpcoming?: boolean;
}) => (
  <div
    className={cn(
      "rounded-lg border p-3 transition-colors",
      activeMeetingId === meeting.id
        ? "border-primary bg-primary/5"
        : isUpcoming
          ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
          : "hover:bg-muted/30"
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">
            {meeting.start_time
              ? format(new Date(meeting.start_time), "d MMM yyyy 'à' HH:mm", { locale: fr })
              : format(new Date(meeting.created_at), 'd MMM yyyy', { locale: fr })
            }
          </span>
          <span className="font-semibold truncate">{meeting.title}</span>
        </div>

        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          {meeting.attendees.length > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {meeting.attendees.length} participant{meeting.attendees.length > 1 ? 's' : ''}
            </span>
          )}
          {meeting.project_count > 0 && (
            <span className="flex items-center gap-1">
              <FolderOpen className="h-3 w-3" />
              {meeting.project_count} action{meeting.project_count > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {meeting.ai_summary && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {meeting.ai_summary}
          </p>
        )}
      </div>

      {meeting.project_count > 0 && (
        <Button
          variant={activeMeetingId === meeting.id ? "default" : "outline"}
          size="sm"
          className="shrink-0 text-xs"
          onClick={() => onFilterByMeeting(
            activeMeetingId === meeting.id ? null : meeting.id
          )}
        >
          {activeMeetingId === meeting.id ? 'Filtre actif' : 'Voir les projets'}
        </Button>
      )}
    </div>
  </div>
);
