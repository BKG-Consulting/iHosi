'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface FacilityBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
}

interface FacilityContext {
  id: string;
  name: string;
  slug: string;
  branding: FacilityBranding;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
}

const FacilityContext = createContext<FacilityContext | null>(null);

export function FacilityProvider({ children }: { children: ReactNode }) {
  const [facility, setFacility] = useState<FacilityContext | null>(null);
  
  useEffect(() => {
    // Read facility context from cookie (set by middleware)
    const facilityContext = document.cookie
      .split('; ')
      .find(row => row.startsWith('facility-context='))
      ?.split('=')[1];
    
    if (facilityContext) {
      try {
        const parsed = JSON.parse(decodeURIComponent(facilityContext));
        setFacility(parsed);
        
        // Apply branding dynamically
        applyBranding(parsed.branding);
        
        console.log('✅ Facility context loaded:', parsed);
      } catch (error) {
        console.error('Failed to parse facility context:', error);
      }
    } else {
      console.log('ℹ️ No facility context found (main app or no subdomain)');
    }
  }, []);
  
  return (
    <FacilityContext.Provider value={facility}>
      {children}
    </FacilityContext.Provider>
  );
}

export function useFacility() {
  const context = useContext(FacilityContext);
  // Don't throw error if no context - allow usage without facility
  return context;
}

export function useFacilityRequired() {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacilityRequired must be used within a facility context');
  }
  return context;
}

function applyBranding(branding: FacilityBranding) {
  // Set CSS custom properties for theming
  const root = document.documentElement;
  
  root.style.setProperty('--facility-primary', branding.primaryColor);
  root.style.setProperty('--facility-secondary', branding.secondaryColor);
  root.style.setProperty('--facility-accent', branding.accentColor);
  
  // Update favicon if provided
  if (branding.logoUrl) {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = branding.logoUrl;
    } else {
      // Create favicon link if it doesn't exist
      const newFavicon = document.createElement('link');
      newFavicon.rel = 'icon';
      newFavicon.href = branding.logoUrl;
      document.head.appendChild(newFavicon);
    }
  }
  
  console.log('🎨 Branding applied:', branding);
}

