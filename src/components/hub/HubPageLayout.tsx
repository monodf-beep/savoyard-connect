import { useState } from "react";
import { HubSidebar } from "./HubSidebar";
import { HubTopbar } from "./HubTopbar";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface HubPageLayoutProps {
  children: React.ReactNode;
  breadcrumb?: string;
  title?: string;
  subtitle?: string;
  orgName?: string;
  orgLogo?: string;
  loading?: boolean;
  headerActions?: React.ReactNode;
  fullWidth?: boolean;
}

export const HubPageLayout = ({ 
  children, 
  breadcrumb,
  title,
  subtitle,
  orgName = "Mon Association",
  orgLogo,
  loading,
  headerActions,
  fullWidth,
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
          breadcrumb={breadcrumb || title || ""}
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          orgName={orgName}
          orgLogo={orgLogo}
        />

        {/* Page Content */}
        <main className={cn("p-4 md:p-6 lg:p-8", fullWidth && "max-w-none")}>
          {/* Page Header */}
          {(title || subtitle || headerActions) && (
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  {title && <h1 className="text-2xl font-bold">{title}</h1>}
                  {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
                </div>
                {headerActions}
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
