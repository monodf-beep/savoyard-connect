import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Meeting {
  id: string;
  title: string;
  start_time: string | null;
  end_time: string | null;
  attendees: Array<{ email?: string; name?: string }>;
  ai_summary: string | null;
  transcript_filename: string | null;
  created_at: string;
  project_count: number;
}

export const useMeetings = (limit = 5) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeetings = async () => {
      // Fetch meetings
      const { data: meetingsData, error } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !meetingsData) {
        console.error('Error fetching meetings:', error);
        setIsLoading(false);
        return;
      }

      // For each meeting, count linked projects
      const meetingIds = meetingsData.map(m => m.id);
      const { data: projectCounts } = await supabase
        .from('projects')
        .select('source_meeting_id')
        .in('source_meeting_id', meetingIds);

      const countMap: Record<string, number> = {};
      (projectCounts || []).forEach(p => {
        if (p.source_meeting_id) {
          countMap[p.source_meeting_id] = (countMap[p.source_meeting_id] || 0) + 1;
        }
      });

      setMeetings(meetingsData.map(m => ({
        id: m.id,
        title: m.title,
        start_time: m.start_time,
        end_time: m.end_time,
        attendees: (m.attendees as any[]) || [],
        ai_summary: m.ai_summary,
        transcript_filename: m.transcript_filename,
        created_at: m.created_at,
        project_count: countMap[m.id] || 0,
      })));
      setIsLoading(false);
    };

    fetchMeetings();
  }, [limit]);

  return { meetings, isLoading, refetch: () => {
    setIsLoading(true);
    // trigger re-fetch by updating state
    setMeetings([]);
  }};
};
