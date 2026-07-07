import { useQuery } from '@tanstack/react-query';
import { academicStructureService } from '../services/academic-structure.service';

export const useAcademicStructureTree = (academicYearId?: string) => {
  return useQuery({
    queryKey: ['academicStructureTree', academicYearId ?? null],
    queryFn: () => academicStructureService.getStructureTree(academicYearId),
  });
};
