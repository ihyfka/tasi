"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isGuest?: boolean;
  createdAt: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: {
    email: string;
    password: string;
  }) => Promise<AuthUser>;
  register: (data: {
    email: string;
    password: string;
    name: string;
  }) => Promise<AuthUser>;
  continueAsGuest: (data?: { email?: string; name?: string }) => AuthUser;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_SESSION_KEY = "tasi_auth_session";
const STORAGE_USERS_KEY = "tasi_registered_users";

interface StoredAccount {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

// Initial demo account so testing login is seamless
const DEFAULT_DEMO_ACCOUNTS: StoredAccount[] = [
  {
    id: "demo_id",
    email: "client@tasi.com",
    passwordHash: "password123",
    name: "Moses Obinna",
    createdAt: new Date().toISOString(),
  },
];

function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(
        STORAGE_USERS_KEY,
        JSON.stringify(DEFAULT_DEMO_ACCOUNTS),
      );
      return DEFAULT_DEMO_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_DEMO_ACCOUNTS;
  }
}

function saveStoredAccounts(accounts: StoredAccount[]) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error("Failed to save accounts in localStorage:", err);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(STORAGE_SESSION_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        setUser(parsed);
      }
    } catch (err) {
      console.error("Failed to load auth session:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistUser = useCallback((userData: AuthUser | null) => {
    setUser(userData);
    try {
      if (userData) {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(userData));
      } else {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    } catch (err) {
      console.error("Failed to persist auth session:", err);
    }
  }, []);

  const login = useCallback(
    async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }): Promise<AuthUser> => {
      // Realistic simulation delay for UX
      await new Promise((res) => setTimeout(res, 600));

      const cleanEmail = email.trim().toLowerCase();
      const accounts = getStoredAccounts();

      const matched = accounts.find(
        (acc) =>
          acc.email.toLowerCase() === cleanEmail &&
          acc.passwordHash === password,
      );

      if (!matched) {
        // If not found in demo accounts, but email and password are provided and valid length
        // We can either throw invalid credentials or allow it if matching demo email with wrong password
        const emailExists = accounts.some(
          (acc) => acc.email.toLowerCase() === cleanEmail,
        );
        if (emailExists) {
          throw new Error(
            "Invalid password. Please check your credentials and try again.",
          );
        } else {
          // If the account does not exist, throw helpful error with suggestion
          throw new Error(
            "No account found with this email. Would you like to create one?",
          );
        }
      }

      const authenticatedUser: AuthUser = {
        id: matched.id,
        email: matched.email,
        name: matched.name,
        createdAt: matched.createdAt,
      };

      persistUser(authenticatedUser);
      return authenticatedUser;
    },
    [persistUser],
  );

  const register = useCallback(
    async ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }): Promise<AuthUser> => {
      await new Promise((res) => setTimeout(res, 600));

      const cleanEmail = email.trim().toLowerCase();
      const accounts = getStoredAccounts();

      if (accounts.some((acc) => acc.email.toLowerCase() === cleanEmail)) {
        throw new Error(
          "An account with this email already exists. Please log in instead.",
        );
      }

      const newAccount: StoredAccount = {
        id: `usr_${Date.now()}`,
        email: cleanEmail,
        passwordHash: password,
        name: name.trim() || cleanEmail.split("@")[0],
        createdAt: new Date().toISOString(),
      };

      accounts.push(newAccount);
      saveStoredAccounts(accounts);

      const authenticatedUser: AuthUser = {
        id: newAccount.id,
        email: newAccount.email,
        name: newAccount.name,
        createdAt: newAccount.createdAt,
      };

      persistUser(authenticatedUser);
      return authenticatedUser;
    },
    [persistUser],
  );

  const continueAsGuest = useCallback(
    (data?: { email?: string; name?: string }): AuthUser => {
      const guestEmail = data?.email?.trim() || "guest@tasi.com";
      const guestName = data?.name?.trim() || "Guest Client";

      const guestUser: AuthUser = {
        id: `guest_${Date.now()}`,
        email: guestEmail,
        name: guestName,
        isGuest: true,
        createdAt: new Date().toISOString(),
      };

      persistUser(guestUser);
      return guestUser;
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to update user session:", err);
      }
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        continueAsGuest,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
