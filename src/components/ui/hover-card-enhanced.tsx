import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "@/lib/utils";

const HoverCardEnhanced = HoverCardPrimitive.Root;

const HoverCardEnhancedTrigger = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <HoverCardPrimitive.Trigger
    ref={ref}
    className={cn(
      "cursor-pointer transition-transform duration-200 hover:scale-[1.02]",
      className
    )}
    {...props}
  />
));
HoverCardEnhancedTrigger.displayName = "HoverCardEnhancedTrigger";

const HoverCardEnhancedContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-lg outline-none",
      "data-[state=open]:animate-scale-in data-[state=closed]:animate-fade-out",
      "backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
HoverCardEnhancedContent.displayName = "HoverCardEnhancedContent";

export { HoverCardEnhanced, HoverCardEnhancedTrigger, HoverCardEnhancedContent };
