"use client";

import { ClerkProvider } from "@clerk/nextjs";

interface ClerkProviderWrapperProps {
  children: React.ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  return (
    <ClerkProvider 
      afterSignOutUrl="/"
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      {children}
    </ClerkProvider>
  );
}
