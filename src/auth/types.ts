export type AuthStatus = "signedOut" | "loading" | "signedIn";

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
};
