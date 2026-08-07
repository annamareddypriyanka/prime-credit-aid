import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export interface DemoUser {
  name: string;
  email: string;
  role: string;
}

const KEY = "adlus-user";

const AuthContext = createContext<{
  user: DemoUser | null;
  ready: boolean;
  login: (email: string) => DemoUser;
  logout: () => void;
}>({ user: null, ready: false, login: () => ({ name: "", email: "", role: "" }), logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw) as DemoUser);
      } catch {
        window.localStorage.removeItem(KEY);
      }
    }
    setReady(true);
  }, []);

  const login = useCallback((email: string) => {
    const name = email
      .split("@")[0]!
      .split(/[._]/)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
    const next: DemoUser = { name: name || "Credit Officer", email, role: "Senior Underwriter" };
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);