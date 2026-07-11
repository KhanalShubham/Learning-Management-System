import { useQuery } from '@tanstack/react-query';
import { facultyService } from '../services/faculty.service';
import type { ListTeachersFilters } from '../types';

export const teachersQueryKey = (filters: ListTeachersFilters) => ['teachers', filters];

export const useTeachers = (filters: ListTeachersFilters) => {
  return useQuery({
    queryKey: teachersQueryKey(filters),
    queryFn: () => facultyService.listTeachers(filters),
    placeholderData: (previousData) => previousData,
  });
};
