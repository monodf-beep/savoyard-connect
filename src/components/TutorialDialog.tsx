import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TutorialStep {
  title: string;
  description: string;
  tips?: string[];
}

interface TutorialDialogProps {
  title: string;
  description: string;
  steps: TutorialStep[];
  benefits?: string[];
}

export const TutorialDialog: React.FC<TutorialDialogProps> = ({
  title,
  description,
  steps,
  benefits,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/10"
        >
          <Info className="h-4 w-4 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Benefits section */}
            {benefits && benefits.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">💡 Intérêt de cette fonctionnalité</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">📋 Comment l'utiliser</h3>
              {steps.map((step, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.tips && step.tips.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {step.tips.map((tip, tipIndex) => (
                            <p key={tipIndex} className="text-xs text-muted-foreground italic pl-4 border-l-2 border-muted">
                              💡 {tip}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
