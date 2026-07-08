import { useQuery, useQueryClient } from '@tanstack/react-query';
import { studentService } from '../services/student.service';

export const studentQueryKey = (id: string) => ['student', id];

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: studentQueryKey(id),
    queryFn: () => studentService.getStudent(id),
    enabled: !!id,
  });
};

export const useInvalidateStudent = () => {
  const queryClient = useQueryClient();
  return (id: string) => {
    queryClient.invalidateQueries({ queryKey: studentQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: ['students'] });
  };
};
