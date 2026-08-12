import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

// Document fonts: Inter for UI text, JetBrains Mono for IDs — both feed the
// --font-sans/--font-mono tokens in ui-tokens.md via next/font/google.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'DVLD — Driver & Vehicle Licensing Department',
  description: 'Internal back-office system for the licensing department',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(inter.variable, jetbrainsMono.variable, "font-sans")}>
      {/* TooltipProvider must sit above the whole tree — ui Tooltips portal
          to document.body, so a provider nested inside a route layout would
          not cover Sheet/portal'd content (app shell 0.C.1). */}
      <body>
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </body>
    </html>
  );
}