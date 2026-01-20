import { useState } from "react";
import { useTranslation } from "react-i18next";
import { HubPageLayout } from "@/components/hub/HubPageLayout";
import { DiagnosticChat } from "@/components/accompagnateur/DiagnosticChat";
import { DiagnosticResult } from "@/components/accompagnateur/DiagnosticResult";

export type DiagnosticStep = "initial" | "followup" | "complete";

export interface DiagnosticState {
  step: DiagnosticStep;
  category: string | null;
  answers: Record<string, string>;
}

export default function Accompagnateur() {
  const { t } = useTranslation();
  const [diagnostic, setDiagnostic] = useState<DiagnosticState>({
    step: "initial",
    category: null,
    answers: {},
  });

  const handleCategorySelect = (category: string) => {
    setDiagnostic({
      step: "followup",
      category,
      answers: {},
    });
  };

  const handleAnswer = (question: string, answer: string) => {
    setDiagnostic((prev) => ({
      ...prev,
      answers: { ...prev.answers, [question]: answer },
      step: "complete",
    }));
  };

  const handleRestart = () => {
    setDiagnostic({
      step: "initial",
      category: null,
      answers: {},
    });
  };

  return (
    <HubPageLayout breadcrumb={t("accompagnateur.title", "L'Accompagnateur")}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Diagnostic Chat Interface */}
        <DiagnosticChat
          diagnostic={diagnostic}
          onCategorySelect={handleCategorySelect}
          onAnswer={handleAnswer}
          onRestart={handleRestart}
        />

        {/* Results: L'Ordonnance */}
        {diagnostic.step === "complete" && (
          <DiagnosticResult
            category={diagnostic.category!}
            answers={diagnostic.answers}
          />
        )}
      </div>
    </HubPageLayout>
  );
}
