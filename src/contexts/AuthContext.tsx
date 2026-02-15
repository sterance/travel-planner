import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { API_URL } from "../config";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStored(): { token: string | null; user: AuthUser | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userRaw = localStorage.getItem(USER_KEY);
    const user = userRaw ? (JSON.parse(userRaw) as AuthUser) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function persist(token: string | null, user: AuthUser | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): ReactElement {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const { token } = loadStored();
    if (!token || !API_URL) {
      setState({ token: null, user: null, loading: false });
      return;
    }
    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          return res.json() as Promise<{ user: AuthUser }>;
        }
        persist(null, null);
        return null;
      })
      .then((data) => {
        if (data?.user) {
          setState({ token, user: data.user, loading: false });
          persist(token, data.user);
        } else {
          setState({ token: null, user: null, loading: false });
        }
      })
      .catch(() => {
        setState({ token: null, user: null, loading: false });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as { token?: string; user?: AuthUser; error?: string };
    if (!res.ok) {
      throw new Error(data.error ?? "login failed");
    }
    if (!data.token || !data.user) {
      throw new Error("invalid response");
    }
    persist(data.token, data.user);
    setState({ token: data.token, user: data.user, loading: false });
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as { token?: string; user?: AuthUser; error?: string };
    if (!res.ok) {
      throw new Error(data.error ?? "registration failed");
    }
    if (!data.token || !data.user) {
      throw new Error("invalid response");
    }
    persist(data.token, data.user);
    setState({ token: data.token, user: data.user, loading: false });
  }, []);

  const logout = useCallback(() => {
    persist(null, null);
    setState({ token: null, user: null, loading: false });
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
