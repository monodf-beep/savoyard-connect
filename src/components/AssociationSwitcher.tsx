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
import { useAssociation } from "@/hooks/useAssociation";
import { useNavigate, Link } from "react-router-dom";
import { Building2, ChevronDown, Plus, Check } from "lucide-react";

export const AssociationSwitcher = () => {
  const { associations, currentAssociation, setCurrentAssociation } = useAssociation();
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
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Mes associations
        </div>
        {associations.map((asso) => (
          <DropdownMenuItem
            key={asso.id}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setCurrentAssociation(asso);
              setIsOpen(false);
            }}
          >
            <Avatar className="h-6 w-6">
              {asso.logo_url ? (
                <AvatarImage src={asso.logo_url} alt={asso.name} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                {getInitials(asso.name)}
              </AvatarFallback>
            </Avatar>
            <span className="flex-1 truncate">{asso.name}</span>
            {currentAssociation.id === asso.id && (
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
          <span>Nouvelle association</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
