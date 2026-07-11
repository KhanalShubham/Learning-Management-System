import { useQuery } from '@tanstack/react-query';
import { facultyService } from '../services/faculty.service';

export const useTeacherSummary = () => {
  return useQuery({
    queryKey: ['teachers-summary'],
    queryFn: () => facultyService.getSummary(),
  });
};
