export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface ManagedUser {
  id: string;
  email: string;
  fullName: string;
  roleId: string;
  status: UserStatus;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  fullName: string;
  roleId: string;
  status?: UserStatus;
}

export type UpdateUserPayload = Partial<Omit<CreateUserPayload, 'password'>> & {
  password?: string;
};

export interface PaginatedUsers {
  data: ManagedUser[];
  total: number;
}
