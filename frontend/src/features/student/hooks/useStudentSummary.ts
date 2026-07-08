import { useQuery } from '@tanstack/react-query';
import { studentService } from '../services/student.service';

export const useStudentSummary = () => {
  return useQuery({
    queryKey: ['students-summary'],
    queryFn: () => studentService.getSummary(),
  });
};
