import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAssociation, AssociationRole } from "@/hooks/useAssociation";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const getRoleBadgeColor = (role: AssociationRole): string => {
  switch (role) {
    case 'owner':
      return 'bg-primary text-primary-foreground';
    case 'admin':
      return 'bg-destructive text-destructive-foreground';
    case 'gestionnaire':
      return 'bg-secondary text-secondary-foreground';
    case 'contributeur':
      return 'bg-accent text-accent-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getRoleLabel = (role: AssociationRole): string => {
  const labels: Record<AssociationRole, string> = {
    owner: 'Proprio',
    admin: 'Admin',
    gestionnaire: 'Gest.',
    contributeur: 'Contrib.',
    membre: 'Membre',
  };
  return labels[role];
};

export const AssociationSwitcher = () => {
  const { associations, currentAssociation, currentMembership, setCurrentAssociation } = useAssociation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentAssociation) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-muted"
        >
          <Avatar className="h-8 w-8">
            {currentAssociation.logo_url ? (
              <AvatarImage src={currentAssociation.logo_url} alt={currentAssociation.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(currentAssociation.name)}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-[150px] truncate font-medium text-sm">
            {currentAssociation.name}
          </span>
          {currentMembership && (
            <Badge className={cn("text-[9px] px-1.5 py-0", getRoleBadgeColor(currentMembership.role))}>
              {getRoleLabel(currentMembership.role)}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Mes associations
        </div>
        {associations.map((membership) => (
          <DropdownMenuItem
            key={membership.id}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setCurrentAssociation(membership.association);
              setIsOpen(false);
            }}
          >
            <Avatar className="h-6 w-6">
              {membership.association.logo_url ? (
                <AvatarImage src={membership.association.logo_url} alt={membership.association.name} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                {getInitials(membership.association.name)}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate">{membership.association.name}</span>
            <Badge className={cn("text-[9px] px-1.5 py-0", getRoleBadgeColor(membership.role))}>
              {getRoleLabel(membership.role)}
            </Badge>
            {currentAssociation.id === membership.association_id && (
              <Check className="h-4 w-4 text-secondary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer text-primary"
          onClick={() => {
            setIsOpen(false);
            navigate("/onboarding-asso");
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Créer / Rejoindre une association</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
