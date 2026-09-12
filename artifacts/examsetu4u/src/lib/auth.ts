import { useCallback, useEffect, useState } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  preferredExamId: string;
  avatarColor: string;
  bio?: string;
  learningStreak: number;
  lastActiveDate: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  profile: UserProfile | null;
  rememberMe: boolean;
}

export const AUTH_STORAGE_KEYS = {
  AUTH: 'examsetu4u_auth',
  USER: 'examsetu4u_user',
  PROFILE: 'examsetu4u_profile',
  PROGRESS: 'examsetu4u_progress',
} as const;

export const DEFAULT_AVATAR_COLORS = [
  { label: 'Vibrant Indigo', value: '#4338ca' },
  { label: 'Electric Violet', value: '#7c3aed' },
  { label: 'Bright Purple', value: '#9333ea' },
  { label: 'Neon Indigo', value: '#6366f1' },
  { label: 'Deep Midnight', value: '#1e1b4b' },
  { label: 'Electric Fuchsia', value: '#c026d3' },
];

export const DEMO_USER: User = {
  id: 'usr_demo_examsetu',
  name: 'राहुल शर्मा (Rahul Sharma)',
  email: 'demo@examsetu4u.com',
  password: 'Password123',
  createdAt: '2025-01-15T09:00:00.000Z',
};

export const DEMO_PROFILE: UserProfile = {
  id: 'usr_demo_examsetu',
  name: 'राहुल शर्मा (Rahul Sharma)',
  email: 'demo@examsetu4u.com',
  joinedDate: '15 जनवरी 2025',
  preferredExamId: 'super-tet',
  avatarColor: '#4338ca',
  bio: 'Super TET और शिक्षण भर्ती परीक्षा 2025 का समर्पित अभ्यर्थी।',
  learningStreak: 6,
  lastActiveDate: new Date().toISOString(),
};

function safeGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch (err) {
    console.warn(`[Auth] Failed reading localStorage key: ${key}`, err);
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch (err) {
    console.warn(`[Auth] Failed writing localStorage key: ${key}`, err);
  }
}

function safeRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Auth] Failed removing localStorage key: ${key}`, err);
  }
}

// Read current user
export function getCurrentUser(): User | null {
  const raw = safeGet(AUTH_STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

// Read current user profile
export function getUserProfile(): UserProfile | null {
  const raw = safeGet(AUTH_STORAGE_KEYS.PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

// Read registered users list for mock multi-user validation
export function getRegisteredUsers(): User[] {
  const raw = safeGet('examsetu4u_users_registry');
  if (!raw) return [DEMO_USER];
  try {
    const list = JSON.parse(raw) as User[];
    if (Array.isArray(list) && list.length > 0) return list;
    return [DEMO_USER];
  } catch {
    return [DEMO_USER];
  }
}

export function saveRegisteredUsers(users: User[]): void {
  safeSet('examsetu4u_users_registry', JSON.stringify(users));
}

// Read auth session
export function getAuthSession(): { isAuthenticated: boolean; rememberMe: boolean; userId: string | null } {
  const raw = safeGet(AUTH_STORAGE_KEYS.AUTH);
  if (!raw) return { isAuthenticated: false, rememberMe: false, userId: null };
  try {
    return JSON.parse(raw);
  } catch {
    return { isAuthenticated: false, rememberMe: false, userId: null };
  }
}

// Set auth session
export function setAuthSession(auth: { isAuthenticated: boolean; rememberMe: boolean; userId: string | null }): void {
  safeSet(AUTH_STORAGE_KEYS.AUTH, JSON.stringify(auth));
}

export function getInitials(name: string): string {
  if (!name) return 'EX';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Auth Hook for React components
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    const session = getAuthSession();
    const user = getCurrentUser();
    const profile = getUserProfile();

    if (session.isAuthenticated && user && profile) {
      return {
        isAuthenticated: true,
        user,
        profile,
        rememberMe: session.rememberMe,
      };
    }

    // Default to unauthenticated
    return {
      isAuthenticated: false,
      user: null,
      profile: null,
      rememberMe: false,
    };
  });

  const syncState = useCallback(() => {
    const session = getAuthSession();
    const user = getCurrentUser();
    const profile = getUserProfile();

    if (session.isAuthenticated && user && profile) {
      setAuthState({
        isAuthenticated: true,
        user,
        profile,
        rememberMe: session.rememberMe,
      });
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        profile: null,
        rememberMe: false,
      });
    }
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === AUTH_STORAGE_KEYS.AUTH ||
        e.key === AUTH_STORAGE_KEYS.USER ||
        e.key === AUTH_STORAGE_KEYS.PROFILE
      ) {
        syncState();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [syncState]);

  // Login handler
  const login = useCallback((email: string, password: string, rememberMe = true): { success: boolean; message?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const registered = getRegisteredUsers();
    
    // Also support DEMO_USER fallback
    let matched = registered.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (!matched && trimmedEmail === DEMO_USER.email.toLowerCase()) {
      matched = DEMO_USER;
    }

    if (!matched) {
      return { success: false, message: 'इस ईमेल से कोई खाता पंजीकृत नहीं है। कृपया Sign Up करें या सही ईमेल दर्ज करें।' };
    }

    if (matched.password && matched.password !== password) {
      return { success: false, message: 'गलत पासवर्ड दर्ज किया गया है। कृपया पुनः प्रयास करें।' };
    }

    // Prepare profile
    let profile = getUserProfile();
    if (!profile || profile.email.toLowerCase() !== trimmedEmail) {
      if (matched.id === DEMO_USER.id) {
        profile = { ...DEMO_PROFILE, lastActiveDate: new Date().toISOString() };
      } else {
        profile = {
          id: matched.id,
          name: matched.name,
          email: matched.email,
          joinedDate: new Date(matched.createdAt).toLocaleDateString('hi-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          preferredExamId: 'super-tet',
          avatarColor: DEFAULT_AVATAR_COLORS[Math.floor(Math.random() * DEFAULT_AVATAR_COLORS.length)].value,
          learningStreak: 1,
          lastActiveDate: new Date().toISOString(),
        };
      }
    } else {
      // Update last active
      profile = { ...profile, lastActiveDate: new Date().toISOString() };
    }

    // Persist
    safeSet(AUTH_STORAGE_KEYS.USER, JSON.stringify(matched));
    safeSet(AUTH_STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    setAuthSession({ isAuthenticated: true, rememberMe, userId: matched.id });

    setAuthState({
      isAuthenticated: true,
      user: matched,
      profile,
      rememberMe,
    });

    return { success: true };
  }, []);

  // Quick Demo Login
  const loginDemo = useCallback(() => {
    return login(DEMO_USER.email, DEMO_USER.password || 'Password123', true);
  }, [login]);

  // Signup handler
  const signup = useCallback((
    name: string,
    email: string,
    password: string,
    preferredExamId = 'super-tet'
  ): { success: boolean; message?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    const registered = getRegisteredUsers();

    if (registered.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, message: 'यह ईमेल पहले से पंजीकृत है। कृपया Login करें।' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      email: trimmedEmail,
      password,
      createdAt: new Date().toISOString(),
    };

    const newProfile: UserProfile = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      joinedDate: new Date().toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      preferredExamId,
      avatarColor: DEFAULT_AVATAR_COLORS[Math.floor(Math.random() * DEFAULT_AVATAR_COLORS.length)].value,
      learningStreak: 1,
      lastActiveDate: new Date().toISOString(),
    };

    saveRegisteredUsers([...registered, newUser]);
    safeSet(AUTH_STORAGE_KEYS.USER, JSON.stringify(newUser));
    safeSet(AUTH_STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
    setAuthSession({ isAuthenticated: true, rememberMe: true, userId: newUser.id });

    setAuthState({
      isAuthenticated: true,
      user: newUser,
      profile: newProfile,
      rememberMe: true,
    });

    return { success: true };
  }, []);

  // Update profile
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setAuthState((current) => {
      if (!current.profile) return current;
      const updated = { ...current.profile, ...updates };
      safeSet(AUTH_STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      
      // Also update user name if changed
      if (updates.name && current.user) {
        const updatedUser = { ...current.user, name: updates.name };
        safeSet(AUTH_STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        return { ...current, profile: updated, user: updatedUser };
      }

      return { ...current, profile: updated };
    });
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    safeRemove(AUTH_STORAGE_KEYS.AUTH);
    safeRemove(AUTH_STORAGE_KEYS.USER);
    // Note: We keep profile in local storage or optionally clear. Keeping allows fast resume.
    setAuthState({
      isAuthenticated: false,
      user: null,
      profile: null,
      rememberMe: false,
    });
  }, []);

  return {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    profile: authState.profile,
    login,
    loginDemo,
    signup,
    updateProfile,
    logout,
  };
}
