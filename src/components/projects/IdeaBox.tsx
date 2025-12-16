import { useState, useEffect } from 'react';
import { Lightbulb, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Idea {
  id: string;
  title: string;
  description: string | null;
  votes_count: number;
  created_at: string;
}

interface IdeaVote {
  idea_id: string;
  points: number;
}

const MAX_POINTS = 25;

export const IdeaBox = () => {
  const [activeTab, setActiveTab] = useState('vote');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [newIdea, setNewIdea] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [voterId, setVoterId] = useState<string>('');

  // Get or create voter identifier (session-based for anonymous users)
  useEffect(() => {
    let id = localStorage.getItem('voter_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('voter_id', id);
    }
    setVoterId(id);
  }, []);

  // Fetch ideas and user's votes
  useEffect(() => {
    const fetchData = async () => {
      const { data: ideasData } = await supabase
        .from('ideas')
        .select('*')
        .order('votes_count', { ascending: false });

      if (ideasData) {
        setIdeas(ideasData);
      }

      if (voterId) {
        const { data: votesData } = await supabase
          .from('idea_votes')
          .select('idea_id, points')
          .eq('voter_identifier', voterId);

        if (votesData) {
          const votesMap: Record<string, number> = {};
          votesData.forEach((v: IdeaVote) => {
            votesMap[v.idea_id] = v.points;
          });
          setVotes(votesMap);
        }
      }
    };

    fetchData();
  }, [voterId]);

  const totalPointsUsed = Object.values(votes).reduce((sum, p) => sum + p, 0);
  const remainingPoints = MAX_POINTS - totalPointsUsed;

  const handleVoteChange = async (ideaId: string, delta: number) => {
    const currentVote = votes[ideaId] || 0;
    const newVote = currentVote + delta;

    if (newVote < 0) return;
    if (delta > 0 && remainingPoints <= 0) {
      toast.error('Plus de points disponibles');
      return;
    }

    const newVotes = { ...votes, [ideaId]: newVote };
    setVotes(newVotes);

    try {
      if (newVote === 0) {
        // Delete vote
        await supabase
          .from('idea_votes')
          .delete()
          .eq('idea_id', ideaId)
          .eq('voter_identifier', voterId);
      } else if (currentVote === 0) {
        // Insert new vote
        await supabase
          .from('idea_votes')
          .insert({ idea_id: ideaId, voter_identifier: voterId, points: newVote });
      } else {
        // Update existing vote
        await supabase
          .from('idea_votes')
          .update({ points: newVote })
          .eq('idea_id', ideaId)
          .eq('voter_identifier', voterId);
      }

      // Refresh ideas to get updated vote counts
      const { data } = await supabase
        .from('ideas')
        .select('*')
        .order('votes_count', { ascending: false });
      if (data) setIdeas(data);
    } catch (error) {
      console.error('Error updating vote:', error);
      // Revert on error
      setVotes(votes);
    }
  };

  const handleSubmitIdea = async () => {
    if (!newIdea.trim()) {
      toast.error('Décrivez votre idée');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('ideas')
        .insert({ title: newIdea.trim() });

      if (error) throw error;

      toast.success('Idée soumise !');
      setNewIdea('');
      setActiveTab('vote');

      // Refresh ideas
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

  const getRankColor = (index: number) => {
    if (index === 0) return 'bg-primary text-primary-foreground';
    if (index === 1) return 'bg-orange-400 text-white';
    if (index === 2) return 'bg-amber-500 text-white';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-6 w-6 text-amber-500" />
        <h2 className="text-xl font-bold">Boîte à Idées</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="submit">Soumettre</TabsTrigger>
          <TabsTrigger value="vote">Voter</TabsTrigger>
          <TabsTrigger value="ranking">Classement</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Proposez une idée pour améliorer le projet.
          </p>
          <Textarea
            placeholder="Décrivez votre idée..."
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            className="min-h-[100px]"
          />
          <Button 
            onClick={handleSubmitIdea} 
            disabled={submitting}
            className="w-full"
          >
            Soumettre l'idée
          </Button>
        </TabsContent>

        <TabsContent value="vote" className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Distribuez vos points parmi les idées que vous souhaitez soutenir.
          </p>
          
          <div className="text-center py-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Points restants</p>
            <p className="text-3xl font-bold">
              {remainingPoints}<span className="text-lg text-muted-foreground"> / {MAX_POINTS}</span>
            </p>
          </div>

          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {ideas.map((idea) => (
                <div 
                  key={idea.id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <span className="text-sm font-medium flex-1 pr-2">{idea.title}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleVoteChange(idea.id, -1)}
                      disabled={(votes[idea.id] || 0) === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-bold">{votes[idea.id] || 0}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleVoteChange(idea.id, 1)}
                      disabled={remainingPoints <= 0}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {ideas.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Aucune idée pour le moment
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Voici les idées les plus populaires, classées par nombre de votes.
          </p>

          <ScrollArea className="h-[350px]">
            <div className="space-y-2 pr-4">
              {ideas.map((idea, index) => (
                <div 
                  key={idea.id} 
                  className="flex items-center gap-3 p-3 rounded-lg border border-border"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(index)}`}>
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium flex-1">{idea.title}</span>
                  <span className="font-bold text-lg">{idea.votes_count}</span>
                </div>
              ))}
              {ideas.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Aucune idée pour le moment
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
