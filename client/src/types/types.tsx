export const ROUTEPATHS = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  THREADS: "/threads",
  THREADSNEW: "/threads/new", // Put this before the dynamic path
} as const;

export interface Session {
  username: string;
  expiry: number;
}
