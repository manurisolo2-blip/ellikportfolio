"use client";

import { useEffect, useRef } from "react";

export function TabTitleManager() {
  const wasHiddenRef = useRef<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearPending = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearPending();
        wasHiddenRef.current = true;
        document.title = "Come Back · ellik";
      } else if (wasHiddenRef.current) {
        clearPending();
        wasHiddenRef.current = false;
        document.title = "Welcome Back · ellik";
        timeoutRef.current = setTimeout(() => {
          document.title = "ellik";
          timeoutRef.current = null;
        }, 2800);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearPending();
    };
  }, []);

  return null;
}
