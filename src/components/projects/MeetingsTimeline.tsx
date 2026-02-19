import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronDown, Users, FolderOpen, Calendar, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Meeting } from '@/hooks/useMeetings';

interface MeetingsTimelineProps {
  meetings: Meeting[];
  isLoading: boolean;
  activeMeetingId: string | null;
  onFilterByMeeting: (meetingId: string | null) => void;
}

export const MeetingsTimeline = ({
  meetings,
  isLoading,
  activeMeetingId,
  onFilterByMeeting,
}: MeetingsTimelineProps) => {
  const [open, setOpen] = useState(false);

  if (isLoading || meetings.length === 0) return null;

  return (
    <div className="mb-6">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="rounded-xl border bg-card">
          <CollapsibleTrigger className="flex items-center gap-2 w-full p-4 hover:bg-muted/50 transition-colors">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-semibold">Dernières réunions</span>
            <Badge variant="secondary" className="ml-1">{meetings.length}</Badge>
            {activeMeetingId && (
              <Badge variant="default" className="ml-2 text-xs">Filtre actif</Badge>
            )}
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground ml-auto transition-transform",
              open && "rotate-180"
            )} />
          </CollapsibleTrigger>

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

              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className={cn(
                    "rounded-lg border p-3 transition-colors",
                    activeMeetingId === meeting.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-muted-foreground">
                          {meeting.start_time
                            ? format(new Date(meeting.start_time), 'd MMM yyyy', { locale: fr })
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
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};
