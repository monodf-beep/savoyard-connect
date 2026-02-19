import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { JobPosting } from '../types/organigramme';
import { JobPostingCard } from '../components/JobPostingCard';
import { JobPostingForm } from '../components/JobPostingForm';
import { HubPageLayout } from '@/components/hub/HubPageLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAssociation } from '@/hooks/useAssociation';
import { Button } from '../components/ui/button';
import { Plus, Briefcase } from 'lucide-react';

const Jobs = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const { currentAssociation } = useAssociation();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedJobPosting, setSelectedJobPosting] = useState<JobPosting | null>(null);

  const activeJobPostings = jobPostings.filter(job => job.isActive);

  const handleSaveJobPosting = (jobPosting: JobPosting) => {
    if (selectedJobPosting) {
      setJobPostings(prev => prev.map(job => 
        job.id === jobPosting.id ? jobPosting : job
      ));
    } else {
      setJobPostings(prev => [...prev, jobPosting]);
    }
    setSelectedJobPosting(null);
  };

  const handleDeleteJobPosting = (jobPostingId: string) => {
    setJobPostings(prev => prev.filter(job => job.id !== jobPostingId));
  };

  const handleEditJobPosting = (jobPosting: JobPosting) => {
    setSelectedJobPosting(jobPosting);
    setIsFormOpen(true);
  };

  const handleAddJobPosting = () => {
    setSelectedJobPosting(null);
    setIsFormOpen(true);
  };

  return (
    <HubPageLayout
      breadcrumb={t('nav.volunteering')}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t('nav.volunteering')}</h1>
            <p className="text-muted-foreground">
              {activeJobPostings.length} opportunité{activeJobPostings.length > 1 ? 's' : ''} disponible{activeJobPostings.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button onClick={handleAddJobPosting}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une mission
            </Button>
          )}
        </div>
      </div>

      {/* Liste des postes */}
      {activeJobPostings.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune mission disponible</h3>
          <p className="text-muted-foreground">
            Il n'y a actuellement aucune recherche de bénévoles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeJobPostings.map((jobPosting) => (
            <JobPostingCard
              key={jobPosting.id}
              jobPosting={jobPosting}
              isAdmin={isAdmin}
              onEdit={handleEditJobPosting}
            />
          ))}
        </div>
      )}

      {/* Formulaire d'ajout/modification */}
      <JobPostingForm
        jobPosting={selectedJobPosting}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedJobPosting(null);
        }}
        onSave={handleSaveJobPosting}
        onDelete={handleDeleteJobPosting}
      />
    </HubPageLayout>
  );
};

export default Jobs;
