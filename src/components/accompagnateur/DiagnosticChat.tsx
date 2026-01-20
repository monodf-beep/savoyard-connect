import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  PiggyBank, 
  Megaphone, 
  Users, 
  FileText,
  RotateCcw,
  MessageCircle,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DiagnosticState } from "@/pages/Accompagnateur";

interface DiagnosticChatProps {
  diagnostic: DiagnosticState;
  onCategorySelect: (category: string) => void;
  onAnswer: (question: string, answer: string) => void;
  onRestart: () => void;
}

const categories = [
  { id: "treasury", labelKey: "accompagnateur.categories.treasury", icon: PiggyBank, emoji: "💰" },
  { id: "communication", labelKey: "accompagnateur.categories.communication", icon: Megaphone, emoji: "📢" },
  { id: "volunteers", labelKey: "accompagnateur.categories.volunteers", icon: Users, emoji: "👥" },
  { id: "admin", labelKey: "accompagnateur.categories.admin", icon: FileText, emoji: "📄" },
];

// Follow-up questions per category
const followUpQuestions: Record<string, { question: string; options: { label: string; value: string }[] }> = {
  treasury: {
    question: "Avez-vous un prévisionnel budgétaire à jour ?",
    options: [
      { label: "Oui, à jour", value: "yes" },
      { label: "Non, pas encore", value: "no" },
      { label: "Je ne sais pas par où commencer", value: "help" },
    ],
  },
  communication: {
    question: "Avez-vous déjà une identité visuelle ?",
    options: [
      { label: "Oui", value: "yes" },
      { label: "Non", value: "no" },
      { label: "En cours de création", value: "wip" },
    ],
  },
  volunteers: {
    question: "Combien de bénévoles actifs avez-vous ?",
    options: [
      { label: "Moins de 5", value: "few" },
      { label: "Entre 5 et 15", value: "medium" },
      { label: "Plus de 15", value: "many" },
    ],
  },
  admin: {
    question: "Vos statuts sont-ils à jour ?",
    options: [
      { label: "Oui", value: "yes" },
      { label: "Non", value: "no" },
      { label: "Je dois vérifier", value: "check" },
    ],
  },
};

export function DiagnosticChat({ 
  diagnostic, 
  onCategorySelect, 
  onAnswer,
  onRestart 
}: DiagnosticChatProps) {
  const { t } = useTranslation();
  const [isTyping, setIsTyping] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Simulate typing effect
  useEffect(() => {
    setIsTyping(true);
    setShowContent(false);
    const timer = setTimeout(() => {
      setIsTyping(false);
      setShowContent(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [diagnostic.step]);

  const currentQuestion = diagnostic.category 
    ? followUpQuestions[diagnostic.category] 
    : null;

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background via-background to-primary/5">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-secondary/10 to-transparent rounded-tr-full" />

      <div className="relative z-10 p-6 md:p-8">
        {/* Header with restart button */}
        {diagnostic.step !== "initial" && (
          <div className="flex justify-end mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRestart}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t("accompagnateur.restart", "Recommencer")}
            </Button>
          </div>
        )}

        {/* Avatar and Message */}
        <div className="flex items-start gap-4 mb-8">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-2xl">
                <Sparkles className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-2 border-background" />
          </div>

          {/* Speech bubble */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-foreground">
                {t("accompagnateur.assistantName", "L'Accompagnateur")}
              </span>
              <Badge variant="secondary" className="text-xs">
                {t("accompagnateur.badge", "IA")}
              </Badge>
            </div>
            
            <div className="relative bg-muted/50 rounded-2xl rounded-tl-none p-4 max-w-xl">
              {isTyping ? (
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                <p className="text-foreground leading-relaxed">
                  {diagnostic.step === "initial" && (
                    t("accompagnateur.greeting", "Bonjour ! Quel défi souhaitez-vous relever aujourd'hui ?")
                  )}
                  {diagnostic.step === "followup" && currentQuestion && (
                    currentQuestion.question
                  )}
                  {diagnostic.step === "complete" && (
                    <>
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        {t("accompagnateur.diagnosticComplete", "Parfait ! J'ai préparé votre plan d'action personnalisé.")}
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Response Options */}
        {showContent && diagnostic.step === "initial" && (
          <div className="animate-fade-in">
            <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {t("accompagnateur.selectChallenge", "Sélectionnez votre thématique")}
            </p>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  size="lg"
                  onClick={() => onCategorySelect(category.id)}
                  className="gap-2 h-auto py-3 px-4 hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105"
                >
                  <span className="text-xl">{category.emoji}</span>
                  <span>{t(category.labelKey, category.id)}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {showContent && diagnostic.step === "followup" && currentQuestion && (
          <div className="animate-fade-in">
            <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {t("accompagnateur.selectOption", "Choisissez votre réponse")}
            </p>
            <div className="flex flex-wrap gap-3">
              {currentQuestion.options.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  size="lg"
                  onClick={() => onAnswer(currentQuestion.question, option.value)}
                  className={cn(
                    "h-auto py-3 px-5 hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105",
                    option.value === "yes" && "hover:border-green-500 hover:bg-green-500/5",
                    option.value === "no" && "hover:border-amber-500 hover:bg-amber-500/5"
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {showContent && diagnostic.step === "complete" && (
          <div className="animate-fade-in text-center py-4">
            <p className="text-muted-foreground">
              {t("accompagnateur.scrollForPlan", "👇 Découvrez votre ordonnance ci-dessous")}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
