import { api } from '@/services/api';
import type { ManagedUser, CreateUserPayload, UpdateUserPayload, PaginatedUsers } from '../types';

export const userService = {
  async list(skip: number, take: number): Promise<PaginatedUsers> {
    const response = await api.get('/users', { params: { skip, take } });
    return response.data.data;
  },

  async getById(id: string): Promise<ManagedUser> {
    const response = await api.get(`/users/${id}`);
    return response.data.data.user;
  },

  async create(payload: CreateUserPayload): Promise<ManagedUser> {
    const response = await api.post('/users', payload);
    return response.data.data.user;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<ManagedUser> {
    const response = await api.put(`/users/${id}`, payload);
    return response.data.data.user;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

export default userService;
