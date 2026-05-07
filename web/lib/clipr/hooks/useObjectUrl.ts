"use client";

import { useEffect, useState } from "react";

export function useObjectUrl(blob?: Blob | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) {
      void Promise.resolve().then(() => setUrl(null));
      return;
    }

    const nextUrl = URL.createObjectURL(blob);
    let isActive = true;

    void Promise.resolve().then(() => {
      if (isActive) {
        setUrl(nextUrl);
      }
    });

    return () => {
      isActive = false;
      URL.revokeObjectURL(nextUrl);
    };
  }, [blob]);

  return url;
}
