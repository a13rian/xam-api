export interface AuthenticatedUser {
  id: string;
  email: string;
  roleIds: string[];
  roleNames: string[];
}
