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
            <div className="space-y-6">
              {/* Skeleton loader for page content */}
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-52 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-36 bg-muted/60 animate-pulse rounded" />
                </div>
              </div>
              
              {/* Cards skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="border border-border rounded-xl p-4 space-y-3 bg-card">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                      <div className="space-y-1 flex-1">
                        <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                        <div className="h-3 w-20 bg-muted/60 animate-pulse rounded" />
                      </div>
                    </div>
                    <div className="h-16 w-full bg-muted/40 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};
