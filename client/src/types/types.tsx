export const ROUTEPATHS = {
  HOME: "/",
  LOGIN: "/login",
} as const;

export interface usernameAndExpiry {
  username: string;
  expiry: number;
}
