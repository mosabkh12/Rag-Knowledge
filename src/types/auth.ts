export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
}
