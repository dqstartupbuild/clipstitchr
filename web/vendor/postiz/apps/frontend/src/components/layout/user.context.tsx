'use client';

import { createContext, FC, ReactNode, useContext } from 'react';

export interface PublishingUserContextValue {
  id: string;
  orgId: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  admin?: boolean;
  timezone?: number;
  [key: string]: unknown;
}

export const UserContext = createContext<
  PublishingUserContextValue | undefined
>(undefined);

/**
 * Retained only as the state seam used by the imported calendar components.
 * ClipStitchr must populate it from a server-verified Clerk tenant adapter.
 */
export const ContextWrapper: FC<{
  user: PublishingUserContextValue;
  children: ReactNode;
}> = ({ user, children }) => (
  <UserContext.Provider value={user}>{children}</UserContext.Provider>
);

export const useUser = () => useContext(UserContext);
