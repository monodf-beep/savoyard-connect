import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AIAssistant } from "@/components/AIAssistant";
import { AdminOnboarding } from "@/components/AdminOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Projects from "./pages/Projects";
import ValueChains from "./pages/ValueChains";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAdmin, user } = useAuth();
  const { settings } = useOrganizationSettings();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Apply custom colors to design system
  useEffect(() => {
    if (settings) {
      document.documentElement.style.setProperty('--primary', settings.primary_color);
      document.documentElement.style.setProperty('--secondary', settings.secondary_color);
    }
  }, [settings]);

  useEffect(() => {
    if (isAdmin && user) {
      const hasSeenOnboarding = localStorage.getItem('admin-onboarding-completed');
      if (!hasSeenOnboarding) {
        // Delay to ensure smooth load
        setTimeout(() => setShowOnboarding(true), 500);
      }
    }
  }, [isAdmin, user]);

  // Expose function to restart onboarding
  useEffect(() => {
    (window as any).restartAdminOnboarding = () => {
      setShowOnboarding(true);
    };
  }, []);
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/value-chains" element={<ValueChains />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {isAdmin && (
        <>
          <AIAssistant />
          <AdminOnboarding open={showOnboarding} onOpenChange={setShowOnboarding} />
        </>
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
