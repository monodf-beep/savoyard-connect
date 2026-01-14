import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Simple analytics hook - can be extended with PostHog or GA
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: string;
}

// Store events in memory for now (can be extended to send to analytics service)
const eventQueue: AnalyticsEvent[] = [];

export const useAnalytics = () => {
  // Track page views
  useEffect(() => {
    trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer,
    });
  }, []);

  const trackEvent = useCallback((event: string, properties?: Record<string, unknown>) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
      timestamp: new Date().toISOString(),
    };

    eventQueue.push(analyticsEvent);
    
    // Log in development
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, properties);
    }

    // Could send to PostHog, GA, or custom endpoint here
    // Example: posthog.capture(event, properties);
  }, []);

  const trackSignup = useCallback(async (userId: string) => {
    trackEvent('signup', { userId });
  }, [trackEvent]);

  const trackOnboardingComplete = useCallback(async (userId: string, associationId?: string) => {
    trackEvent('onboarding_complete', { userId, associationId });
  }, [trackEvent]);

  const trackAssociationCreated = useCallback(async (associationId: string, associationName: string) => {
    trackEvent('association_created', { associationId, associationName });
  }, [trackEvent]);

  const trackFeatureUsed = useCallback((feature: string, details?: Record<string, unknown>) => {
    trackEvent('feature_used', { feature, ...details });
  }, [trackEvent]);

  return {
    trackEvent,
    trackSignup,
    trackOnboardingComplete,
    trackAssociationCreated,
    trackFeatureUsed,
  };
};

// Export for use in non-hook contexts
export const analytics = {
  track: (event: string, properties?: Record<string, unknown>) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: window.location.href,
      },
      timestamp: new Date().toISOString(),
    };
    eventQueue.push(analyticsEvent);
    
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, properties);
    }
  },
  getQueue: () => [...eventQueue],
};
