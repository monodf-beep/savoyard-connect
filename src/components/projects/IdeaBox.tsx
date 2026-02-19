import { useState, useEffect } from 'react';
import { Lightbulb, ThumbsUp, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface IdeaBoxProps {
  embedded?: boolean;
}

interface Idea {
  id: string;
  title: string;
  votes_count: number;
  created_at: string;
}

export const IdeaBox = ({ embedded = false }: IdeaBoxProps) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [newIdea, setNewIdea] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voterId, setVoterId] = useState('');

  useEffect(() => {
    let id = localStorage.getItem('voter_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('voter_id', id);
    }
    setVoterId(id);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: ideasData } = await supabase
        .from('ideas')
        .select('*')
        .order('votes_count', { ascending: false });

      if (ideasData) setIdeas(ideasData);

      if (voterId) {
        const { data: votesData } = await supabase
          .from('idea_votes')
          .select('idea_id')
          .eq('voter_identifier', voterId);

        if (votesData) {
          setVotedIds(new Set(votesData.map(v => v.idea_id)));
        }
      }
    };

    fetchData();
  }, [voterId]);

  const toggleVote = async (ideaId: string) => {
    const hasVoted = votedIds.has(ideaId);

    // Optimistic update
    const newVotedIds = new Set(votedIds);
    if (hasVoted) {
      newVotedIds.delete(ideaId);
    } else {
      newVotedIds.add(ideaId);
    }
    setVotedIds(newVotedIds);

    try {
      if (hasVoted) {
        await supabase
          .from('idea_votes')
          .delete()
          .eq('idea_id', ideaId)
          .eq('voter_identifier', voterId);
      } else {
        await supabase
          .from('idea_votes')
          .insert({ idea_id: ideaId, voter_identifier: voterId, points: 1 });
      }

      const { data } = await supabase
        .from('ideas')
        .select('*')
        .order('votes_count', { ascending: false });
      if (data) setIdeas(data);
    } catch (error) {
      console.error('Error toggling vote:', error);
      setVotedIds(votedIds); // revert
    }
  };

  const handleSubmitIdea = async () => {
    if (!newIdea.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('ideas')
        .insert({ title: newIdea.trim() });

      if (error) throw error;

      toast.success('Idée soumise !');
      setNewIdea('');

      const { data } = await supabase
        .from('ideas')
        .select('*')
        .order('votes_count', { ascending: false });
      if (data) setIdeas(data);
    } catch (error) {
      console.error('Error submitting idea:', error);
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn(
      embedded ? '' : 'bg-card border border-border rounded-xl p-6 shadow-sm'
    )}>
      {!embedded && (
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">Boîte à Idées</h2>
        </div>
      )}

      <ScrollArea className="max-h-[350px]">
        <div className="space-y-2 pr-2">
          {ideas.map((idea) => {
            const hasVoted = votedIds.has(idea.id);
            return (
              <div
                key={idea.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <Button
                  variant={hasVoted ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'h-8 min-w-[56px] gap-1.5 flex-shrink-0',
                    hasVoted && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => toggleVote(idea.id)}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  {idea.votes_count}
                </Button>
                <span className="text-sm font-medium flex-1">{idea.title}</span>
              </div>
            );
          })}
          {ideas.length === 0 && (
            <p className="text-center text-muted-foreground py-6 text-sm">
              Aucune idée pour le moment. Soyez le premier !
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Submit new idea */}
      <div className="flex gap-2 mt-4">
        <Input
          placeholder="Proposer une idée..."
          value={newIdea}
          onChange={(e) => setNewIdea(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !submitting && handleSubmitIdea()}
        />
        <Button
          size="icon"
          onClick={handleSubmitIdea}
          disabled={submitting || !newIdea.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
