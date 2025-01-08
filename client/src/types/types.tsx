export const ROUTEPATHS = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
} as const;

export interface usernameAndExpiry {
  username: string;
  expiry: number;
}
