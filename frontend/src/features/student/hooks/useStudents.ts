import { useQuery } from '@tanstack/react-query';
import { studentService } from '../services/student.service';
import type { ListStudentsFilters } from '../types';

export const studentsQueryKey = (filters: ListStudentsFilters) => ['students', filters];

export const useStudents = (filters: ListStudentsFilters) => {
  return useQuery({
    queryKey: studentsQueryKey(filters),
    queryFn: () => studentService.listStudents(filters),
    placeholderData: (previousData) => previousData,
  });
};
