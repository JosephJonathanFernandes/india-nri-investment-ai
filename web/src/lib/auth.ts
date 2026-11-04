export const TOKEN_KEY = 'access_token';
export const USER_KEY = 'nri_user';

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}
export function setUser(user: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getUser(): any | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null');
  } catch {
    return null;
  }
}
export function removeUser() {
  localStorage.removeItem(USER_KEY);
}
export function isLoggedIn(): boolean {
  return !!getToken();
}
