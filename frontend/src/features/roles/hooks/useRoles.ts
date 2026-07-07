import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roleService } from '../services/role.service';
import type { CreateRolePayload, UpdateRolePayload } from '../types';

const ROLES_QUERY_KEY = ['roles'];

export const useRoles = () => {
  return useQuery({
    queryKey: ROLES_QUERY_KEY,
    queryFn: roleService.list,
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => roleService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY }),
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      roleService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY }),
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY }),
  });
};
