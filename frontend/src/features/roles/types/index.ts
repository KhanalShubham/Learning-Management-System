export interface RolePermission {
  permission: {
    id: string;
    code: string;
    description: string | null;
  };
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  permissions: RolePermission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
}

export type UpdateRolePayload = Partial<CreateRolePayload>;
