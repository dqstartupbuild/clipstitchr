'use client';

import React, { ReactNode } from 'react';
import { TopMenu } from '../layout/top.menu';

/**
 * Focused source shell retained for mounting the publishing workspace.
 *
 * Postiz authentication, organization selection, billing, assistant tooling, support,
 * extension, notification, telemetry, and brand chrome were intentionally
 * removed at the import boundary. ClipStitchr supplies those concerns.
 */
export const LayoutComponent = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full text-[var(--text-primary)]">
      <aside
        aria-label="Publishing workspace"
        className="w-[88px] border-r border-[var(--border)] bg-[var(--surface)] p-3"
      >
        <TopMenu />
      </aside>
      <main className="flex min-w-0 flex-1 bg-[var(--background)]">
        {children}
      </main>
    </div>
  );
};
