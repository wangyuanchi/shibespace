export const ROUTEPATHS = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
} as const;

export interface Session {
  username: string;
  expiry: number;
}
