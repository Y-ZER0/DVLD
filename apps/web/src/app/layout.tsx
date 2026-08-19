import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/shared/providers/query-provider";

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
      <body>
        <QueryProvider>
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}