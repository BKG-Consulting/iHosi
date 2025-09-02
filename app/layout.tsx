import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { ClerkProviderWrapper } from "@/components/providers/clerk-provider";
import { NoSSR } from "@/components/providers/no-ssr";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Healthcare System",
  description: "Ihosi Health Information Management Systems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <NoSSR>
          <ClerkProviderWrapper>
            {children}
            <Toaster richColors position="top-center" />
          </ClerkProviderWrapper>
        </NoSSR>
      </body>
    </html>
  );
}
