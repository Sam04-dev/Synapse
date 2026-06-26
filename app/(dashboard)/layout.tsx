"use client";

import { useCallback, useRef, useState, useEffect, Suspense } from "react";
import { useMockAuth, AuthContext } from "@/lib/mock-auth";
import { DemoStateProvider } from "@/lib/demo-state";
import LoginScreen from "@/components/LoginScreen";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, login, logout } = useMockAuth();
  const freshLoginRef = useRef(false);
  const [dashboardOpacity, setDashboardOpacity] = useState(1);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      freshLoginRef.current = true;
      setDashboardOpacity(0);
      await login(email, password);
    },
    [login]
  );

  useEffect(() => {
    if (!user || !freshLoginRef.current) return;
    freshLoginRef.current = false;
    const raf = requestAnimationFrame(() => {
      setDashboardOpacity(1);
    });
    return () => cancelAnimationFrame(raf);
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-2 w-2 bg-accent animate-pulse-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense>
        <LoginScreen onComplete={handleLogin} />
      </Suspense>
    );
  }

  return (
    <AuthContext.Provider value={user}>
      <DemoStateProvider>
      <div
        className="flex h-screen overflow-hidden bg-background dot-grid-bg transition-opacity duration-[400ms] ease-out"
        style={{ opacity: dashboardOpacity }}
      >
        <Sidebar user={user} onLogout={logout} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <main className="relative flex-1 overflow-hidden">
            {children}
          </main>
          <footer className="flex items-center justify-between border-t border-border bg-card px-5 py-1.5">
            <span className="text-[10px] font-mono text-muted-foreground/40">
              &copy; 2026 Synapse — Memory Engine for AI Agents
            </span>
            <div className="flex items-center gap-4">
              <a href="/docs" className="text-[10px] font-mono text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                API Docs
              </a>
              <a href="/debug" className="text-[10px] font-mono text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                Debug
              </a>
            </div>
          </footer>
        </div>
      </div>
      </DemoStateProvider>
    </AuthContext.Provider>
  );
}
