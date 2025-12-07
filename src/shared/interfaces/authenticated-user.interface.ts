export interface AuthenticatedUser {
  id: string;
  email: string;
  organizationId: string | null;
  roleIds: string[];
  roleNames: string[];
}
