export type RoleType = 'ADMIN' | 'CUSTOMER' | 'CLAIMS_OFFICER' | 'UNDERWRITER';

export interface Role {
  roleId: number;
  roleName: RoleType;
}

export const ROLE_LABELS: Record<RoleType, string> = {
  ADMIN: 'Administrator',
  CUSTOMER: 'Customer',
  CLAIMS_OFFICER: 'Claims Officer',
  UNDERWRITER: 'Underwriter'
};

export const ROLE_COLORS: Record<RoleType, string> = {
  ADMIN: 'bg-red-600',
  CUSTOMER: 'bg-blue-600',
  CLAIMS_OFFICER: 'bg-green-600',
  UNDERWRITER: 'bg-purple-600'
};

