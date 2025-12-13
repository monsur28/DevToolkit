import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DevToolkit - Simplify. Debug. Build.',
  description: 'A comprehensive collection of developer tools including JSON formatter, Base64 encoder/decoder, JWT decoder, UUID generator, and regex tester.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          <main className="container mx-auto min-h-screen pt-24">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}