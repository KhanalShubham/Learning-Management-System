import { api } from '@/services/api';
import type { RoleWithPermissions, CreateRolePayload, UpdateRolePayload } from '../types';

export const roleService = {
  async list(): Promise<RoleWithPermissions[]> {
    const response = await api.get('/roles');
    return response.data.data.roles;
  },

  async getById(id: string): Promise<RoleWithPermissions> {
    const response = await api.get(`/roles/${id}`);
    return response.data.data.role;
  },

  async create(payload: CreateRolePayload): Promise<RoleWithPermissions> {
    const response = await api.post('/roles', payload);
    return response.data.data.role;
  },

  async update(id: string, payload: UpdateRolePayload): Promise<RoleWithPermissions> {
    const response = await api.put(`/roles/${id}`, payload);
    return response.data.data.role;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/roles/${id}`);
  },
};

export default roleService;
