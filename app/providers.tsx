"use client";

import { useSocket } from "@/hooks/useSocket";

export function Providers({ children }: { children: React.ReactNode }) {
  useSocket();
  return <>{children}</>;
}
