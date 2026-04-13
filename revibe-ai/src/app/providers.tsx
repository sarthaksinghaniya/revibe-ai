"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { AppStateProvider } from "@/lib/appState";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AppStateProvider>{children}</AppStateProvider>
    </SessionProvider>
  );
}
