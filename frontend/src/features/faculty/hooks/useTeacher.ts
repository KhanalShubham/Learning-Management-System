import { useQuery, useQueryClient } from '@tanstack/react-query';
import { facultyService } from '../services/faculty.service';

export const teacherQueryKey = (id: string) => ['teacher', id];

export const useTeacher = (id: string) => {
  return useQuery({
    queryKey: teacherQueryKey(id),
    queryFn: () => facultyService.getTeacher(id),
    enabled: !!id,
  });
};

export const useInvalidateTeacher = () => {
  const queryClient = useQueryClient();
  return (id: string) => {
    queryClient.invalidateQueries({ queryKey: teacherQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: ['teachers'] });
  };
};
