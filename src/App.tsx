import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AIAssistant } from "@/components/AIAssistant";
import { AdminOnboarding } from "@/components/AdminOnboarding";
import { SectionLeaderOnboarding } from "@/components/SectionLeaderOnboarding";
import { AssociationProvider } from "@/hooks/useAssociation";
import { useAuth } from "@/hooks/useAuth";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import Projects from "./pages/Projects";
import Contributors from "./pages/Contributors";
import ValueChains from "./pages/ValueChains";
import Onboarding from "./pages/Onboarding";
import OnboardingAsso from "./pages/OnboardingAsso";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Finance from "./pages/Finance";
import Admin from "./pages/Admin";
import Pricing from "./pages/Pricing";
import SportLanding from "./pages/silos/SportLanding";
import CultureLanding from "./pages/silos/CultureLanding";
import Experts from "./pages/Experts";
import DirectoryHub from "./pages/DirectoryHub";
import Opportunites from "./pages/Opportunites";
import Toolbox from "./pages/Toolbox";

import Members from "./pages/Members";
import Mutualisation from "./pages/Mutualisation";
import Accompagnateur from "./pages/Accompagnateur";
import AdhesionReseau from "./pages/AdhesionReseau";
import AssociationProfile from "./pages/AssociationProfile";
import Profile from "./pages/Profile";
import NetworkProjects from "./pages/NetworkProjects";
import ModuleStore from "./pages/ModuleStore";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import LegalMentions from "./pages/LegalMentions";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import { MembershipProvider } from "./hooks/useMembership";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAdmin, isSectionLeader, user } = useAuth();
  const { settings } = useOrganizationSettings();
  const [showAdminOnboarding, setShowAdminOnboarding] = useState(false);
  const [showLeaderOnboarding, setShowLeaderOnboarding] = useState(false);
  const location = useLocation();

  // Check if we're on public pages
  const isPublicPage = ['/', '/signup', '/login', '/onboarding', '/onboarding-asso'].includes(location.pathname);

  // Apply custom colors to design system (only for non-landing pages)
  useEffect(() => {
    if (settings && !['/', '/signup', '/login'].includes(location.pathname)) {
      const root = document.documentElement;
      root.style.setProperty('--primary', settings.primary_color);
      root.style.setProperty('--accent', settings.primary_color);
      root.style.setProperty('--ring', settings.primary_color);
      root.style.setProperty('--sidebar-primary', settings.primary_color);
      root.style.setProperty('--sidebar-ring', settings.primary_color);
      root.style.setProperty('--secondary', settings.secondary_color);
    }
  }, [settings, location.pathname]);

  useEffect(() => {
    if (isAdmin && user) {
      const hasSeenOnboarding = localStorage.getItem('admin-onboarding-completed');
      if (!hasSeenOnboarding) {
        setTimeout(() => setShowAdminOnboarding(true), 500);
      }
    } else if (isSectionLeader && user && !isAdmin) {
      const hasSeenLeaderOnboarding = localStorage.getItem('section-leader-onboarding-completed');
      if (!hasSeenLeaderOnboarding) {
        setTimeout(() => setShowLeaderOnboarding(true), 500);
      }
    }
  }, [isAdmin, isSectionLeader, user]);

  useEffect(() => {
    (window as any).restartAdminOnboarding = () => setShowAdminOnboarding(true);
    (window as any).restartLeaderOnboarding = () => setShowLeaderOnboarding(true);
  }, []);
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding-asso" element={<OnboardingAsso />} />
        {/* /hub redirects to /dashboard */}
        <Route path="/hub" element={<Navigate to="/dashboard" replace />} />
        <Route path="/mutualisation" element={<Mutualisation />} />
        <Route path="/adhesion-reseau" element={<AdhesionReseau />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/accompagnateur" element={<Accompagnateur />} />
        <Route path="/members" element={<Members />} />
        <Route path="/organigramme" element={<Index />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contributors" element={<Contributors />} />
        <Route path="/value-chains" element={<ValueChains />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/toolbox" element={<Toolbox />} />
        <Route path="/tarifs" element={<Pricing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        {/* Silos thématiques */}
        <Route path="/silos/sport" element={<SportLanding />} />
        <Route path="/silos/culture" element={<CultureLanding />} />
        <Route path="/experts" element={<Experts />} />
        <Route path="/annuaire" element={<DirectoryHub />} />
        <Route path="/annuaire/:id" element={<AssociationProfile />} />
        <Route path="/opportunites" element={<Opportunites />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/projets-reseau" element={<NetworkProjects />} />
        <Route path="/module-store" element={<ModuleStore />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/mentions-legales" element={<LegalMentions />} />
        <Route path="/cgu" element={<TermsOfService />} />
        <Route path="/confidentialite" element={<PrivacyPolicy />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {isAdmin && !isPublicPage && (
        <>
          <AIAssistant />
          <AdminOnboarding open={showAdminOnboarding} onOpenChange={setShowAdminOnboarding} />
        </>
      )}
      {isSectionLeader && !isAdmin && !isPublicPage && (
        <SectionLeaderOnboarding open={showLeaderOnboarding} onOpenChange={setShowLeaderOnboarding} />
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AssociationProvider>
        <MembershipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </MembershipProvider>
      </AssociationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
