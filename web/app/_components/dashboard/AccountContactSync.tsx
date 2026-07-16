"use client";

import { useEffect, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AccountContactSync() {
  const { isAuthenticated } = useConvexAuth();
  const syncCurrentAccountContact = useMutation(
    api.accountEmail.syncCurrentAccountContact.syncCurrentAccountContact,
  );
  const attempted = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || attempted.current) {
      return;
    }

    attempted.current = true;
    void syncCurrentAccountContact({}).catch(() => {
      // Billing and account access remain available if service-email sync is paused.
    });
  }, [isAuthenticated, syncCurrentAccountContact]);

  return null;
}
