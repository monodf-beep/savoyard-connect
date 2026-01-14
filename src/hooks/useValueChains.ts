import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ValueChain, ValueChainSegment, SegmentActor } from '@/types/valueChain';
import { Person, Section } from '@/types/organigramme';
import { toast } from 'sonner';

export const useValueChains = () => {
  const [chains, setChains] = useState<ValueChain[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Core data loading logic (shared between initial load and refresh)
  const fetchAllData = async () => {
    // Load all people from organigramme
    const { data: peopleData, error: peopleError } = await supabase.rpc('people_public_fn');
    if (peopleError) throw peopleError;
    
    const formattedPeople: Person[] = (peopleData || []).map((p: any) => ({
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      photo: p.avatar_url,
      role: p.title,
      description: p.bio,
      linkedin: p.linkedin,
    }));

    // Load value chains
    const { data: chainsData, error: chainsError } = await supabase
      .from('value_chains')
      .select('*')
      .order('title');
    
    if (chainsError) throw chainsError;

    // Load segments
    const { data: segmentsData, error: segmentsError } = await supabase
      .from('value_chain_segments')
      .select('*')
      .order('display_order');
    
    if (segmentsError) throw segmentsError;

    // Load segment actors
    const { data: actorsData, error: actorsError } = await supabase
      .from('segment_actors')
      .select('*');
    
    if (actorsError) throw actorsError;

    // Load segment sections
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('segment_sections')
      .select('*');
    
    if (sectionsError) throw sectionsError;

    // Load all sections from organigramme
    const { data: allSections, error: allSectionsError } = await supabase
      .from('sections')
      .select('*');
    
    if (allSectionsError) throw allSectionsError;

    // Format sections
    const formattedSections: Section[] = (allSections || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      type: 'commission' as const,
      isExpanded: s.is_expanded,
      members: [],
    }));

    // Build complete structure
    const chainsWithSegments: ValueChain[] = (chainsData || []).map((chain) => {
      const chainSegments = (segmentsData || [])
        .filter((seg: any) => seg.value_chain_id === chain.id)
        .map((seg: any): ValueChainSegment => {
          const segmentActorLinks = (actorsData || []).filter(
            (actor: any) => actor.segment_id === seg.id
          );
          const segmentActors = segmentActorLinks
            .map((link: any) => formattedPeople.find((p) => p.id === link.person_id))
            .filter(Boolean) as Person[];

          const segmentSectionLinks = (sectionsData || []).filter(
            (section: any) => section.segment_id === seg.id
          );
          const segmentSections = segmentSectionLinks
            .map((link: any) => {
              const section = allSections?.find((s: any) => s.id === link.section_id);
              if (!section) return null;
              return {
                id: section.id,
                title: section.title,
                type: 'commission' as const,
                isExpanded: section.is_expanded,
                members: [],
              };
            })
            .filter(Boolean) as any[];

          return {
            id: seg.id,
            value_chain_id: seg.value_chain_id,
            function_name: seg.function_name,
            display_order: seg.display_order,
            position_x: seg.position_x,
            position_y: seg.position_y,
            actors: segmentActors,
            sections: segmentSections,
          };
        });

      return {
        ...chain,
        segments: chainSegments,
        approval_status: (chain.approval_status as 'pending' | 'approved' | 'rejected' | undefined) || 'pending',
        viewport_x: chain.viewport_x,
        viewport_y: chain.viewport_y,
        viewport_zoom: chain.viewport_zoom,
      };
    });

    return { formattedPeople, formattedSections, chainsWithSegments };
  };

  // Initial load (shows full page loader)
  const loadData = async () => {
    try {
      setLoading(true);
      const { formattedPeople, formattedSections, chainsWithSegments } = await fetchAllData();
      setPeople(formattedPeople);
      setSections(formattedSections);
      setChains(chainsWithSegments);
    } catch (error: any) {
      console.error('Error loading value chains:', error);
      toast.error('Erreur lors du chargement des chaînes de valeur');
    } finally {
      setLoading(false);
    }
  };

  // Silent refresh (no loader, for background updates)
  const loadDataSilently = async () => {
    try {
      setIsRefreshing(true);
      const { formattedPeople, formattedSections, chainsWithSegments } = await fetchAllData();
      setPeople(formattedPeople);
      setSections(formattedSections);
      setChains(chainsWithSegments);
    } catch (error: any) {
      console.error('Error refreshing value chains:', error);
      // Don't show toast for silent refresh failures
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Écouter les événements de succès de l'assistant IA pour rafraîchir automatiquement
  useEffect(() => {
    const handleAISuccess = () => {
      loadData();
    };

    window.addEventListener('aiAssistantSuccess', handleAISuccess);
    return () => {
      window.removeEventListener('aiAssistantSuccess', handleAISuccess);
    };
  }, []);

  const createChain = async (title: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('value_chains')
        .insert({ title, description })
        .select()
        .single();

      if (error) throw error;
      toast.success('Chaîne de valeur créée');
      await loadData();
      return data;
    } catch (error: any) {
      console.error('Error creating chain:', error);
      toast.error('Erreur lors de la création');
      throw error;
    }
  };

  const updateChain = async (chainId: string, updates: Partial<ValueChain>) => {
    try {
      const { error } = await supabase
        .from('value_chains')
        .update(updates)
        .eq('id', chainId);

      if (error) throw error;
      toast.success('Chaîne mise à jour');
      await loadData();
    } catch (error: any) {
      console.error('Error updating chain:', error);
      toast.error('Erreur lors de la mise à jour');
      throw error;
    }
  };

  const deleteChain = async (chainId: string) => {
    try {
      const { error } = await supabase
        .from('value_chains')
        .delete()
        .eq('id', chainId);

      if (error) throw error;
      toast.success('Chaîne supprimée');
      await loadData();
    } catch (error: any) {
      console.error('Error deleting chain:', error);
      toast.error('Erreur lors de la suppression');
      throw error;
    }
  };

  const saveSegments = async (
    chainId: string, 
    segments: Array<{ function_name: string; actorIds: string[]; sectionIds?: string[] }>
  ) => {
    try {
      // Delete existing segments for this chain
      const { error: deleteError } = await supabase
        .from('value_chain_segments')
        .delete()
        .eq('value_chain_id', chainId);

      if (deleteError) throw deleteError;

      // Create new segments
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        const { data: segmentData, error: segmentError } = await supabase
          .from('value_chain_segments')
          .insert({
            value_chain_id: chainId,
            function_name: segment.function_name,
            display_order: i,
          })
          .select()
          .single();

        if (segmentError) throw segmentError;

        // Add actors to segment
        if (segment.actorIds.length > 0) {
          const actorInserts = segment.actorIds.map((actorId) => ({
            segment_id: segmentData.id,
            person_id: actorId,
          }));

          const { error: actorError } = await supabase
            .from('segment_actors')
            .insert(actorInserts);

          if (actorError) throw actorError;
        }

        // Add sections to segment
        if (segment.sectionIds && segment.sectionIds.length > 0) {
          const sectionInserts = segment.sectionIds.map((sectionId) => ({
            segment_id: segmentData.id,
            section_id: sectionId,
          }));

          const { error: sectionError } = await supabase
            .from('segment_sections')
            .insert(sectionInserts);

          if (sectionError) throw sectionError;
        }
      }

      toast.success('Segments enregistrés');
      await loadData();
    } catch (error: any) {
      console.error('Error saving segments:', error);
      toast.error('Erreur lors de l\'enregistrement des segments');
      throw error;
    }
  };

  const moveActor = async (actorId: string, fromSegmentId: string, toSegmentId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('segment_actors')
        .delete()
        .eq('segment_id', fromSegmentId)
        .eq('person_id', actorId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('segment_actors')
        .insert({
          segment_id: toSegmentId,
          person_id: actorId,
        });

      if (insertError) throw insertError;

      toast.success('Acteur déplacé');
      await loadData();
    } catch (error: any) {
      console.error('Error moving actor:', error);
      toast.error('Erreur lors du déplacement');
      throw error;
    }
  };

  const mergeChains = async (chainAId: string, chainBId: string, newTitle: string) => {
    try {
      // Create new chain
      const { data: newChain, error: createError } = await supabase
        .from('value_chains')
        .insert({ title: newTitle })
        .select()
        .single();

      if (createError) throw createError;

      // Get segments from both chains
      const { data: segmentsA } = await supabase
        .from('value_chain_segments')
        .select('*, segment_actors(*)')
        .eq('value_chain_id', chainAId)
        .order('display_order');

      const { data: segmentsB } = await supabase
        .from('value_chain_segments')
        .select('*, segment_actors(*)')
        .eq('value_chain_id', chainBId)
        .order('display_order');

      const allSegments = [...(segmentsA || []), ...(segmentsB || [])];

      // Recreate segments in new chain
      for (let i = 0; i < allSegments.length; i++) {
        const seg = allSegments[i];
        const { data: newSeg, error: segError } = await supabase
          .from('value_chain_segments')
          .insert({
            value_chain_id: newChain.id,
            function_name: seg.function_name,
            display_order: i,
          })
          .select()
          .single();

        if (segError) throw segError;

        // Copy actors
        if (seg.segment_actors && seg.segment_actors.length > 0) {
          const actorInserts = seg.segment_actors.map((a: any) => ({
            segment_id: newSeg.id,
            person_id: a.person_id,
          }));

          await supabase.from('segment_actors').insert(actorInserts);
        }
      }

      // Delete old chains
      await supabase.from('value_chains').delete().eq('id', chainAId);
      await supabase.from('value_chains').delete().eq('id', chainBId);

      toast.success('Chaînes fusionnées');
      await loadData();
    } catch (error: any) {
      console.error('Error merging chains:', error);
      toast.error('Erreur lors de la fusion');
      throw error;
    }
  };

  const splitChain = async (
    chainId: string,
    splitIndex: number,
    title1: string,
    title2: string
  ) => {
    try {
      const chain = chains.find((c) => c.id === chainId);
      if (!chain || !chain.segments) throw new Error('Chain not found');

      const segments1 = chain.segments.slice(0, splitIndex);
      const segments2 = chain.segments.slice(splitIndex);

      // Create two new chains
      const { data: newChain1 } = await supabase
        .from('value_chains')
        .insert({ title: title1 })
        .select()
        .single();

      const { data: newChain2 } = await supabase
        .from('value_chains')
        .insert({ title: title2 })
        .select()
        .single();

      if (!newChain1 || !newChain2) throw new Error('Failed to create new chains');

      // Recreate segments for chain 1
      for (let i = 0; i < segments1.length; i++) {
        const seg = segments1[i];
        const { data: newSeg } = await supabase
          .from('value_chain_segments')
          .insert({
            value_chain_id: newChain1.id,
            function_name: seg.function_name,
            display_order: i,
          })
          .select()
          .single();

        if (newSeg && seg.actors) {
          const actorInserts = seg.actors.map((a) => ({
            segment_id: newSeg.id,
            person_id: a.id,
          }));
          await supabase.from('segment_actors').insert(actorInserts);
        }
      }

      // Recreate segments for chain 2
      for (let i = 0; i < segments2.length; i++) {
        const seg = segments2[i];
        const { data: newSeg } = await supabase
          .from('value_chain_segments')
          .insert({
            value_chain_id: newChain2.id,
            function_name: seg.function_name,
            display_order: i,
          })
          .select()
          .single();

        if (newSeg && seg.actors) {
          const actorInserts = seg.actors.map((a) => ({
            segment_id: newSeg.id,
            person_id: a.id,
          }));
          await supabase.from('segment_actors').insert(actorInserts);
        }
      }

      // Delete original chain
      await supabase.from('value_chains').delete().eq('id', chainId);

      toast.success('Chaîne scindée');
      await loadData();
    } catch (error: any) {
      console.error('Error splitting chain:', error);
      toast.error('Erreur lors de la scission');
      throw error;
    }
  };

  const reorderSegments = async (chainId: string, segmentIds: string[]) => {
    try {
      // Update display_order for each segment
      for (let i = 0; i < segmentIds.length; i++) {
        const { error } = await supabase
          .from('value_chain_segments')
          .update({ display_order: i })
          .eq('id', segmentIds[i]);
        
        if (error) throw error;
      }
      
      await loadData();
    } catch (error: any) {
      console.error('Error reordering segments:', error);
      toast.error('Erreur lors de la réorganisation');
      throw error;
    }
  };

  const saveSegmentPositions = async (
    positions: Array<{ id: string; x: number; y: number; order: number }>,
    viewport?: { x: number; y: number; zoom: number },
    chainId?: string
  ) => {
    try {
      // Update positions and order for each segment
      for (const pos of positions) {
        const { error } = await supabase
          .from('value_chain_segments')
          .update({ 
            position_x: pos.x, 
            position_y: pos.y,
            display_order: pos.order 
          })
          .eq('id', pos.id);
        
        if (error) throw error;
      }

      // Save viewport if provided
      if (viewport && chainId) {
        const { error: viewportError } = await supabase
          .from('value_chains')
          .update({
            viewport_x: viewport.x,
            viewport_y: viewport.y,
            viewport_zoom: viewport.zoom,
          })
          .eq('id', chainId);
        
        if (viewportError) throw viewportError;
      }
      
      // Use silent refresh to avoid full page reload
      await loadDataSilently();
    } catch (error: any) {
      console.error('Error saving segment positions:', error);
      throw error;
    }
  };

  return {
    chains,
    people,
    sections,
    loading,
    createChain,
    updateChain,
    deleteChain,
    saveSegments,
    moveActor,
    mergeChains,
    splitChain,
    reorderSegments,
    saveSegmentPositions,
    refetch: loadData,
  };
};
