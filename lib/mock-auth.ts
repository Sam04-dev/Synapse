"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import type { SessionUser } from "@/lib/auth";

export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatarInitials: string;
  plan: "free" | "pro" | "enterprise";
  isDemoUser: boolean;
}

const DEMO_EMAIL = "robertsamueli40@gmail.com";
const DEMO_PASSWORD = "Synapse@123";
const AUTH_KEY = "synapse_auth";

const DEMO_USER: MockUser = {
  id: "usr_01HXYZ",
  email: DEMO_EMAIL,
  name: "Robert Samuel",
  avatarInitials: "RS",
  plan: "pro",
  isDemoUser: true,
};

function apiUserToMockUser(u: SessionUser): MockUser {
  const parts = u.name.split(" ");
  const initials = parts.map((p) => p[0]?.toUpperCase() ?? "").join("").slice(0, 2) || "??";
  return { id: u.id, email: u.email, name: u.name, avatarInitials: initials, plan: "pro", isDemoUser: true };
}

export function useMockAuth() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/auth/session");
        const data = (await res.json()) as { user: SessionUser | null };
        if (data.user) {
          setUser(apiUserToMockUser(data.user));
          setLoading(false);
          return;
        }
      } catch { /* silent — fall through to demo check */ }

      const stored = sessionStorage.getItem(AUTH_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as MockUser;
          if (parsed?.email && typeof parsed.isDemoUser === "boolean") setUser(parsed);
        } catch { sessionStorage.removeItem(AUTH_KEY); }
      }
      setLoading(false);
    }
    init();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // If a real session cookie was just set by LoginScreen, read it
    try {
      const res = await fetch("/api/auth/session");
      const data = (await res.json()) as { user: SessionUser | null };
      if (data.user) {
        setUser(apiUserToMockUser(data.user));
        return true;
      }
    } catch { /* silent */ }

    // Demo fallback
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(DEMO_USER));
      setUser(DEMO_USER);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch { /* silent */ }
    sessionStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  return { user, loading, login, logout };
}

export const AuthContext = createContext<MockUser | null>(null);

export function useAuth(): MockUser | null {
  return useContext(AuthContext);
}
