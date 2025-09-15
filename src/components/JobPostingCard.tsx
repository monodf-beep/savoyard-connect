import React from 'react';
import { JobPosting } from '../types/organigramme';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, Calendar, Edit2, ExternalLink } from 'lucide-react';

interface JobPostingCardProps {
  jobPosting: JobPosting;
  isAdmin: boolean;
  onEdit?: (jobPosting: JobPosting) => void;
}

export const JobPostingCard: React.FC<JobPostingCardProps> = ({
  jobPosting,
  isAdmin,
  onEdit
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(jobPosting);
  };

  const handleApply = () => {
    window.open(jobPosting.applicationUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'CDI': return 'default';
      case 'CDD': return 'secondary';
      case 'Stage': return 'outline';
      case 'Freelance': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="group hover:shadow-md transition-all duration-200 hover:scale-[1.02] animate-fade-in h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{jobPosting.title}</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <span className="font-medium">{jobPosting.department}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {jobPosting.location}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getTypeVariant(jobPosting.type)}>
                {jobPosting.type}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {formatDate(jobPosting.publishedDate)}
              </div>
            </div>
          </div>
          
          {isAdmin && (
            <Button
              onClick={handleEdit}
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {jobPosting.description}
          </p>
          
          {jobPosting.requirements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Compétences requises :</h4>
              <div className="flex flex-wrap gap-1">
                {jobPosting.requirements.slice(0, 3).map((req, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {req}
                  </Badge>
                ))}
                {jobPosting.requirements.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{jobPosting.requirements.length - 3} autres
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleApply}
          className="w-full hover-scale mt-auto"
          size="sm"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Postuler
        </Button>
      </CardContent>
    </Card>
  );
};