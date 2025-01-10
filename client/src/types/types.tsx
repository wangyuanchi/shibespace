export const ROUTEPATHS = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  THREADS: "/threads",
} as const;

export interface Session {
  username: string;
  expiry: number;
}
