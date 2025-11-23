import { Button } from './ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface ApprovalActionsProps {
  onApprove: () => void;
  onReject: () => void;
  itemType: 'projet' | 'chaîne de valeur';
}

export const ApprovalActions = ({ onApprove, onReject, itemType }: ApprovalActionsProps) => {
  return (
    <div className="flex gap-2">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" className="text-green-700 dark:text-green-300 border-green-500/30 hover:bg-green-500/10">
            <CheckCircle className="h-4 w-4 mr-1" />
            Approuver
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approuver ce {itemType} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le {itemType} sera publié et le responsable pourra le modifier.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onApprove} className="bg-green-600 hover:bg-green-700">
              Approuver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button size="sm" variant="outline" className="text-red-700 dark:text-red-300 border-red-500/30 hover:bg-red-500/10">
            <XCircle className="h-4 w-4 mr-1" />
            Rejeter
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter ce {itemType} ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le {itemType} sera marqué comme rejeté. Le responsable devra le modifier ou le supprimer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={onReject} className="bg-red-600 hover:bg-red-700">
              Rejeter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
