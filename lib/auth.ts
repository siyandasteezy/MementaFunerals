import { User, AuthUser } from './types';
import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'mementa_users';
const CURRENT_USER_KEY = 'mementa_current_user';

function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): { success: boolean; error?: string } {
  const users = getUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const newUser: User = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const authUser: AuthUser = { id: newUser.id, name: newUser.name, email: newUser.email };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));

  return { success: true };
}

export function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}): { success: boolean; error?: string } {
  const users = getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const authUser: AuthUser = { id: user.id, name: user.name, email: user.email };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(authUser));

  return { success: true };
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CURRENT_USER_KEY);
}
