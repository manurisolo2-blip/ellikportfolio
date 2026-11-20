"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

export function TabTitleManager() {
  const { locale } = useLanguage();
  const localeRef = useRef(locale);
  const wasHiddenRef = useRef<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  useEffect(() => {
    const clearPending = () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      const lang = localeRef.current;
      if (document.hidden) {
        clearPending();
        wasHiddenRef.current = true;
        document.title = lang === "es" ? "Volvé — ellik" : "Come Back — ellik";
      } else if (wasHiddenRef.current) {
        clearPending();
        wasHiddenRef.current = false;
        document.title = lang === "es" ? "Bienvenido — ellik" : "Welcome Back — ellik";
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
