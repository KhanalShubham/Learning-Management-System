import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/user.service';
import type { CreateUserPayload, UpdateUserPayload } from '../types';

const USERS_QUERY_KEY = (skip: number, take: number) => ['users', skip, take];

export const useUsers = (skip: number, take: number) => {
  return useQuery({
    queryKey: USERS_QUERY_KEY(skip, take),
    queryFn: () => userService.list(skip, take),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};
