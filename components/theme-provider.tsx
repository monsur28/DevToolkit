'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  // This useEffect only runs on the client, after the page has loaded.
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // On the server, we don't render the provider.
  // This prevents the error.
  if (!mounted) {
    return <>{children}</>;
  }

  // Once mounted on the client, we can safely render the provider.
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}