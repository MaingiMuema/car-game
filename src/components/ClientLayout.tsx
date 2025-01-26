'use client';

import { Providers } from "./Providers";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <body className="antialiased">
      <Providers>{children}</Providers>
    </body>
  );
}
