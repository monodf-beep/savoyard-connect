import { useState } from "react";
import { HubSidebar } from "./HubSidebar";
import { HubTopbar } from "./HubTopbar";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface HubPageLayoutProps {
  children: React.ReactNode;
  breadcrumb: string;
  orgName?: string;
  orgLogo?: string;
}

export const HubPageLayout = ({ 
  children, 
  breadcrumb,
  orgName = "Mon Association",
  orgLogo,
}: HubPageLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <HubSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <HubSidebar 
            collapsed={false} 
            onToggle={() => setMobileMenuOpen(false)} 
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div 
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        {/* Topbar */}
        <HubTopbar 
          breadcrumb={breadcrumb}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          orgName={orgName}
          orgLogo={orgLogo}
        />

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
