import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AIAssistant } from "@/components/AIAssistant";
import { AdminOnboarding } from "@/components/AdminOnboarding";
import { SectionLeaderOnboarding } from "@/components/SectionLeaderOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Projects from "./pages/Projects";
import Contributors from "./pages/Contributors";
import ValueChains from "./pages/ValueChains";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Finance from "./pages/Finance";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAdmin, isSectionLeader, user } = useAuth();
  const { settings } = useOrganizationSettings();
  const [showAdminOnboarding, setShowAdminOnboarding] = useState(false);
  const [showLeaderOnboarding, setShowLeaderOnboarding] = useState(false);
  const location = useLocation();

  // Check if we're on the onboarding page
  const isOnboardingPage = location.pathname === '/onboarding';

  // Apply custom colors to design system
  useEffect(() => {
    if (settings) {
      const root = document.documentElement;
      // Primary color and its derivatives
      root.style.setProperty('--primary', settings.primary_color);
      root.style.setProperty('--accent', settings.primary_color);
      root.style.setProperty('--ring', settings.primary_color);
      root.style.setProperty('--sidebar-primary', settings.primary_color);
      root.style.setProperty('--sidebar-ring', settings.primary_color);
      
      // Secondary color
      root.style.setProperty('--secondary', settings.secondary_color);
    }
  }, [settings]);

  useEffect(() => {
    if (isAdmin && user) {
      const hasSeenOnboarding = localStorage.getItem('admin-onboarding-completed');
      if (!hasSeenOnboarding) {
        // Delay to ensure smooth load
        setTimeout(() => setShowAdminOnboarding(true), 500);
      }
    } else if (isSectionLeader && user && !isAdmin) {
      const hasSeenLeaderOnboarding = localStorage.getItem('section-leader-onboarding-completed');
      if (!hasSeenLeaderOnboarding) {
        // Delay to ensure smooth load
        setTimeout(() => setShowLeaderOnboarding(true), 500);
      }
    }
  }, [isAdmin, isSectionLeader, user]);

  // Expose function to restart onboarding
  useEffect(() => {
    (window as any).restartAdminOnboarding = () => {
      setShowAdminOnboarding(true);
    };
    (window as any).restartLeaderOnboarding = () => {
      setShowLeaderOnboarding(true);
    };
  }, []);
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/organigramme" element={<Index />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contributors" element={<Contributors />} />
        <Route path="/value-chains" element={<ValueChains />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<Onboarding />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Hide AI Assistant on onboarding page */}
      {isAdmin && !isOnboardingPage && (
        <>
          <AIAssistant />
          <AdminOnboarding open={showAdminOnboarding} onOpenChange={setShowAdminOnboarding} />
        </>
      )}
      {isSectionLeader && !isAdmin && !isOnboardingPage && (
        <SectionLeaderOnboarding open={showLeaderOnboarding} onOpenChange={setShowLeaderOnboarding} />
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
